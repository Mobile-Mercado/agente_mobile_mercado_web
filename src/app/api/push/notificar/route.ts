import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/apiAuth";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { enviarPushParaCliente, type PushPayload } from "@/lib/webpush";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export type TipoNotificacao = "entregador_saiu" | "entregador_chegando";

export async function POST(req: NextRequest) {
  try {
    const adminError = requireAdminSession(req);
    if (adminError) return adminError;

    const { clientId, tipo, etaMinutos, slug } = await req.json() as {
      clientId: string;
      tipo: TipoNotificacao;
      etaMinutos?: number;
      slug?: string;
    };

    if (!clientId || !tipo) {
      return NextResponse.json({ error: "clientId e tipo sao obrigatorios." }, { status: 400 });
    }

    if (tipo !== "entregador_saiu" && tipo !== "entregador_chegando") {
      return NextResponse.json({ error: "Tipo de notificacao invalido." }, { status: 400 });
    }

    const db = getAdminDb();
    if (!db) {
      return NextResponse.json({ error: "firebase-admin-unavailable" }, { status: 503 });
    }

    const subDoc = await db
      .collection("Users")
      .doc(clientId)
      .collection("pushSubscription")
      .doc("default")
      .get();

    if (!subDoc.exists) {
      return NextResponse.json({ error: "Cliente sem subscription de notificacao." }, { status: 404 });
    }

    const subscription = subDoc.data() as {
      endpoint: string;
      keys: { p256dh: string; auth: string };
    };

    const url = slug ? `/${slug}` : "/";
    const payload: PushPayload = tipo === "entregador_saiu"
      ? {
          title: "Pedido a caminho!",
          body: `Seu entregador saiu. Previsao de chegada: ${etaMinutos ?? 30} min.`,
          url,
          tag: "entrega-saiu",
        }
      : {
          title: "Entregador chegando!",
          body: "Seu entregador esta chegando. Prepare-se para receber!",
          url,
          tag: "entrega-chegando",
        };

    await enviarPushParaCliente(subscription, payload);

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao enviar notificacao.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
