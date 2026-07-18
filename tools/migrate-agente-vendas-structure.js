#!/usr/bin/env node

/**
 * Migra a estrutura antiga:
 *   AgenteVendas/{id}
 *
 * Para a estrutura centralizada:
 *   Agentes/AgenteVendas/Usuarios/{userId}
 *   Agentes/AgenteVendas/CapturasDados/{companyId__eventId}
 *   Agentes/AgenteVendas/MetricasCapturasPorEstabelecimento/{companyId}
 *   Agentes/AgenteVendas/NotasEFeedbacks/{companyId__feedbackId}
 *   Agentes/AgenteVendas/TermosBuscadosPorEstabelecimento/{companyId}/termos/{termoId}
 *   Agentes/AgenteVendas/TemposResposta/{companyId__eventId}
 *
 * Por padrao roda em DRY-RUN. Use --apply para gravar.
 * Este script nao apaga a estrutura antiga.
 */

const fs = require("fs");
const path = require("path");
const admin = require("firebase-admin");

const args = new Set(process.argv.slice(2));
const APPLY = args.has("--apply");

const AGENTES_COLLECTION = "Agentes";
const AGENTE_VENDAS_DOC = "AgenteVendas";
const LEGACY_COLLECTION = "AgenteVendas";

const USERS_COLLECTION = "Usuarios";
const CONVERSAS_COLLECTION = "conversas";
const MENSAGENS_COLLECTION = "mensagens";
const CAPTURE_EVENTS_COLLECTION = "CapturasDados";
const CAPTURE_METRICS_COLLECTION = "MetricasCapturasPorEstabelecimento";
const RESPONSE_TIMES_COLLECTION = "TemposResposta";
const FEEDBACKS_COLLECTION = "NotasEFeedbacks";
const SEARCH_TERMS_COLLECTION = "TermosBuscadosPorEstabelecimento";
const SEARCH_TERMS_SUBCOLLECTION = "termos";

function cleanDocId(value) {
  return String(value ?? "").replace(/\//g, "_").slice(0, 500);
}

function joinedDocId(parentId, childId) {
  return cleanDocId(`${parentId}__${childId}`);
}

function readArg(name, fallback = "") {
  const prefix = `--${name}=`;
  const found = process.argv.slice(2).find((item) => item.startsWith(prefix));
  if (found) return found.slice(prefix.length);
  return process.env[name.toUpperCase().replaceAll("-", "_")] || fallback;
}

function loadServiceAccount() {
  const explicitPath = readArg("service-account", "");
  const defaultPath = path.join(__dirname, "..", "appmobileprod-19505.json");
  const serviceAccountPath = explicitPath || defaultPath;

  if (fs.existsSync(serviceAccountPath)) {
    return require(path.resolve(serviceAccountPath));
  }

  return null;
}

function initAdmin() {
  if (admin.apps.length) return admin.firestore();

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_KEY?.replace(/\\n/g, "\n");

  if (projectId && clientEmail && privateKey) {
    admin.initializeApp({
      credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
      databaseURL: `https://${projectId}.firebaseio.com`,
    });
    return admin.firestore();
  }

  const serviceAccount = loadServiceAccount();
  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`,
    });
    return admin.firestore();
  }

  admin.initializeApp();
  return admin.firestore();
}

class Writer {
  constructor(db) {
    this.db = db;
    this.batch = db.batch();
    this.pending = 0;
    this.writes = 0;
  }

  async set(ref, data, options = { merge: true }) {
    this.writes += 1;
    if (!APPLY) return;

    this.batch.set(ref, data, options);
    this.pending += 1;

    if (this.pending >= 400) {
      await this.flush();
    }
  }

  async flush() {
    if (!APPLY || this.pending === 0) return;
    await this.batch.commit();
    this.batch = this.db.batch();
    this.pending = 0;
  }
}

async function copyMessages(writer, legacyConversaRef, newConversaRef) {
  const mensagensSnap = await legacyConversaRef.collection(MENSAGENS_COLLECTION).get();
  for (const mensagemDoc of mensagensSnap.docs) {
    await writer.set(
      newConversaRef.collection(MENSAGENS_COLLECTION).doc(mensagemDoc.id),
      mensagemDoc.data(),
      { merge: true },
    );
  }
  return mensagensSnap.size;
}

async function copyUser(writer, agentRoot, legacyDoc) {
  const userRef = agentRoot.collection(USERS_COLLECTION).doc(legacyDoc.id);
  await writer.set(userRef, legacyDoc.data(), { merge: true });

  const conversasSnap = await legacyDoc.ref.collection(CONVERSAS_COLLECTION).get();
  let mensagens = 0;

  for (const conversaDoc of conversasSnap.docs) {
    const conversaRef = userRef.collection(CONVERSAS_COLLECTION).doc(conversaDoc.id);
    await writer.set(conversaRef, conversaDoc.data(), { merge: true });
    mensagens += await copyMessages(writer, conversaDoc.ref, conversaRef);
  }

  return { conversas: conversasSnap.size, mensagens };
}

async function copyCompanyCollections(writer, agentRoot, legacyDoc) {
  const companyId = legacyDoc.id;
  let capturas = 0;
  let metricas = 0;
  let feedbacks = 0;
  let termos = 0;
  let temposResposta = 0;

  const capturasSnap = await legacyDoc.ref.collection("capturasDeDados").get();
  for (const eventDoc of capturasSnap.docs) {
    await writer.set(
      agentRoot.collection(CAPTURE_EVENTS_COLLECTION).doc(joinedDocId(companyId, eventDoc.id)),
      { ...eventDoc.data(), legacyPath: eventDoc.ref.path },
      { merge: true },
    );
  }
  capturas = capturasSnap.size;

  const metricasSnap = await legacyDoc.ref.collection("metricasDeCapturas").get();
  for (const metricDoc of metricasSnap.docs) {
    await writer.set(
      agentRoot.collection(CAPTURE_METRICS_COLLECTION).doc(companyId),
      { ...metricDoc.data(), legacyMetricDocId: metricDoc.id, legacyPath: metricDoc.ref.path },
      { merge: true },
    );
    metricas += 1;
  }

  const feedbackSnap = await legacyDoc.ref.collection("notasEFeedbacks").get();
  for (const feedbackDoc of feedbackSnap.docs) {
    await writer.set(
      agentRoot.collection(FEEDBACKS_COLLECTION).doc(joinedDocId(companyId, feedbackDoc.id)),
      { ...feedbackDoc.data(), legacyPath: feedbackDoc.ref.path },
      { merge: true },
    );
  }
  feedbacks = feedbackSnap.size;

  const termosSnap = await legacyDoc.ref.collection("termosBuscados").get();
  for (const termoDoc of termosSnap.docs) {
    await writer.set(
      agentRoot
        .collection(SEARCH_TERMS_COLLECTION)
        .doc(companyId)
        .collection(SEARCH_TERMS_SUBCOLLECTION)
        .doc(termoDoc.id),
      { ...termoDoc.data(), legacyPath: termoDoc.ref.path },
      { merge: true },
    );
  }
  termos = termosSnap.size;

  const temposSnap = await legacyDoc.ref.collection("temposResposta").get();
  for (const tempoDoc of temposSnap.docs) {
    await writer.set(
      agentRoot.collection(RESPONSE_TIMES_COLLECTION).doc(joinedDocId(companyId, tempoDoc.id)),
      { ...tempoDoc.data(), legacyPath: tempoDoc.ref.path },
      { merge: true },
    );
  }
  temposResposta = temposSnap.size;

  return { capturas, metricas, feedbacks, termos, temposResposta };
}

async function main() {
  const db = initAdmin();
  const agentRoot = db.collection(AGENTES_COLLECTION).doc(AGENTE_VENDAS_DOC);
  const writer = new Writer(db);

  await writer.set(agentRoot, {
    tipo: "agente_vendas",
    estrutura: "centralizada",
    migradoEm: admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });

  const legacySnap = await db.collection(LEGACY_COLLECTION).get();
  const resumo = {
    docsRaiz: legacySnap.size,
    usuarios: 0,
    conversas: 0,
    mensagens: 0,
    capturas: 0,
    metricas: 0,
    feedbacks: 0,
    termos: 0,
    temposResposta: 0,
  };

  for (const legacyDoc of legacySnap.docs) {
    const [conversasSnap, capturasSnap, metricasSnap, feedbackSnap, termosSnap, temposSnap] =
      await Promise.all([
        legacyDoc.ref.collection(CONVERSAS_COLLECTION).limit(1).get(),
        legacyDoc.ref.collection("capturasDeDados").limit(1).get(),
        legacyDoc.ref.collection("metricasDeCapturas").limit(1).get(),
        legacyDoc.ref.collection("notasEFeedbacks").limit(1).get(),
        legacyDoc.ref.collection("termosBuscados").limit(1).get(),
        legacyDoc.ref.collection("temposResposta").limit(1).get(),
      ]);

    if (!conversasSnap.empty) {
      const result = await copyUser(writer, agentRoot, legacyDoc);
      resumo.usuarios += 1;
      resumo.conversas += result.conversas;
      resumo.mensagens += result.mensagens;
    }

    if (
      !capturasSnap.empty ||
      !metricasSnap.empty ||
      !feedbackSnap.empty ||
      !termosSnap.empty ||
      !temposSnap.empty
    ) {
      const result = await copyCompanyCollections(writer, agentRoot, legacyDoc);
      resumo.capturas += result.capturas;
      resumo.metricas += result.metricas;
      resumo.feedbacks += result.feedbacks;
      resumo.termos += result.termos;
      resumo.temposResposta += result.temposResposta;
    }
  }

  await writer.flush();

  console.log(APPLY ? "Migracao aplicada." : "DRY-RUN: nenhuma gravacao foi feita.");
  console.log(JSON.stringify({ ...resumo, gravacoesPlanejadas: writer.writes }, null, 2));
}

main().catch((error) => {
  console.error("Falha na migracao:", error);
  process.exitCode = 1;
});
