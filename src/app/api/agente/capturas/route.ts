import { NextRequest, NextResponse } from "next/server";
import { admin, getAdminDb } from "@/lib/firebaseAdmin";
import type { AgenteCaptureEvent, AgenteCaptureEventType } from "@/services/firestore";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const CAPTURE_COUNTER_FIELD: Record<AgenteCaptureEventType, string> = {
  site_visit: "totalVisitas",
  entered_without_login: "usuariosEntraramSemLogar",
  left_without_login: "usuariosEntraramESairamSemLogar",
  logged_in: "usuariosEntraramELogaram",
  cart_filled: "usuariosPreencheramCarrinho",
  cart_not_completed: "usuariosComCarrinhoSemPedido",
  return_visit: "totalRetornosUsuarios",
  return_second_visit: "usuariosVoltaramSegundaVez",
  return_tenth_visit: "usuariosVoltaramDecimaVez",
  return_more_than_30_visits: "usuariosVoltaramMaisDe30Vezes",
  search_performed: "buscasRealizadas",
  search_no_results: "buscasSemResultado",
  product_shown: "produtosExibidos",
  product_added: "produtosAdicionados",
  checkout_started: "checkoutsIniciados",
  checkout_abandoned: "checkoutsAbandonados",
  order_completed: "pedidosConcluidos",
  payment_error: "errosPagamento",
  minimum_order_block: "bloqueiosPedidoMinimo",
  feedback_submitted: "feedbacksRecebidos",
};

function isCaptureEventType(value: unknown): value is AgenteCaptureEventType {
  return typeof value === "string" && value in CAPTURE_COUNTER_FIELD;
}

function sanitizeEvent(value: unknown): AgenteCaptureEvent | null {
  if (!value || typeof value !== "object") return null;
  const event = value as Partial<AgenteCaptureEvent>;

  if (
    typeof event.eventId !== "string" ||
    typeof event.companyId !== "string" ||
    typeof event.visitorId !== "string" ||
    typeof event.sessionId !== "string" ||
    !isCaptureEventType(event.eventType)
  ) {
    return null;
  }

  return {
    eventId: event.eventId.replace(/\//g, "_").slice(0, 500),
    eventType: event.eventType,
    companyId: event.companyId,
    visitorId: event.visitorId,
    sessionId: event.sessionId,
    userDocId: typeof event.userDocId === "string" ? event.userDocId : null,
    metadata: event.metadata && typeof event.metadata === "object" ? event.metadata : {},
  };
}

export async function POST(request: NextRequest) {
  try {
    const db = getAdminDb();
    if (!db) {
      return NextResponse.json(
        { error: "Firebase Admin nao configurado no servidor" },
        { status: 500 }
      );
    }

    const body = await request.json();

    if (body?.kind === "event") {
      const event = sanitizeEvent(body.event);
      if (!event) {
        return NextResponse.json({ error: "Evento invalido" }, { status: 400 });
      }

      const root = db.collection("AgenteVendas").doc(event.companyId);
      const eventRef = root.collection("capturasDeDados").doc(event.eventId);
      const metricRef = root.collection("metricasDeCapturas").doc("resumo");

      await db.runTransaction(async (transaction) => {
        const existing = await transaction.get(eventRef);
        if (existing.exists) return;

        const now = admin.firestore.FieldValue.serverTimestamp();
        transaction.set(eventRef, {
          idEvento: event.eventId,
          tipoEvento: event.eventType,
          estabelecimentoId: event.companyId,
          visitanteId: event.visitorId,
          sessaoId: event.sessionId,
          usuarioId: event.userDocId,
          dados: event.metadata,
          criadoEm: now,
        });
        transaction.set(metricRef, {
          estabelecimentoId: event.companyId,
          atualizadoEm: now,
          [CAPTURE_COUNTER_FIELD[event.eventType]]: admin.firestore.FieldValue.increment(1),
        }, { merge: true });
      });

      return NextResponse.json({ success: true });
    }

    if (body?.kind === "feedback") {
      const feedback = body.feedback && typeof body.feedback === "object"
        ? body.feedback as Record<string, unknown>
        : null;

      if (!feedback || typeof feedback.companyId !== "string" || typeof feedback.visitorId !== "string") {
        return NextResponse.json({ error: "Feedback invalido" }, { status: 400 });
      }

      const ref = await db
        .collection("AgenteVendas")
        .doc(feedback.companyId)
        .collection("notasEFeedbacks")
        .add({
          estabelecimentoId: feedback.companyId,
          visitanteId: feedback.visitorId,
          sessaoId: typeof feedback.sessionId === "string" ? feedback.sessionId : "",
          usuarioId: typeof feedback.userDocId === "string" ? feedback.userDocId : null,
          nota: typeof feedback.nota === "number" ? feedback.nota : null,
          feedback: typeof feedback.feedback === "string" ? feedback.feedback : "",
          conversaId: typeof feedback.conversaId === "string" ? feedback.conversaId : null,
          criadoEm: admin.firestore.FieldValue.serverTimestamp(),
        });

      return NextResponse.json({ success: true, id: ref.id });
    }

    return NextResponse.json({ error: "Tipo invalido" }, { status: 400 });
  } catch (error) {
    console.error("Erro ao registrar capturas do agente:", error);
    return NextResponse.json(
      { error: "Erro interno ao registrar capturas" },
      { status: 500 }
    );
  }
}
