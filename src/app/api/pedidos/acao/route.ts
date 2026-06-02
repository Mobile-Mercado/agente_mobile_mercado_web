import { NextRequest, NextResponse } from "next/server";
import { admin, getAdminDb } from "@/lib/firebaseAdmin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function cleanStatus(status: unknown): string {
  return String(status ?? "")
    .replace(/^PurchaseStatus\./, "")
    .trim();
}

function isAutomaticCancelStatus(status: string): boolean {
  return status === "waitingForOrderPayment" || status === "waitingForPayment";
}

function isRefundRequestStatus(status: string): boolean {
  return status === "pending";
}

function isSupportRequestStatus(status: string): boolean {
  return ["accepted", "preparing", "delivering", "delivered"].includes(status);
}

async function verifyUser(userDocId: string, authHeader: string | null) {
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!token) return false;

  const decoded = await admin.auth().verifyIdToken(token);
  const db = getAdminDb();
  if (!db) return false;

  const userSnap = await db.collection("Users").doc(userDocId).get();
  return userSnap.exists && userSnap.data()?.userAuthId === decoded.uid;
}

export async function POST(request: NextRequest) {
  try {
    const db = getAdminDb();
    if (!db) {
      return NextResponse.json({ error: "Firebase Admin nao configurado" }, { status: 500 });
    }

    const body = await request.json();
    const pedidoId = typeof body?.pedidoId === "string" ? body.pedidoId : "";
    const userDocId = typeof body?.userDocId === "string" ? body.userDocId : "";
    const motivo = typeof body?.motivo === "string" ? body.motivo.trim().slice(0, 500) : "";

    if (!pedidoId || !userDocId) {
      return NextResponse.json({ error: "pedidoId e userDocId sao obrigatorios" }, { status: 400 });
    }

    const autorizado = await verifyUser(userDocId, request.headers.get("authorization"));
    if (!autorizado) {
      return NextResponse.json({ error: "Nao autorizado" }, { status: 403 });
    }

    const pedidoRef = db.collection("PurchaseRequests").doc(pedidoId);
    const now = admin.firestore.FieldValue.serverTimestamp();

    const result = await db.runTransaction(async (transaction) => {
      const pedidoSnap = await transaction.get(pedidoRef);
      if (!pedidoSnap.exists) {
        return { status: 404, body: { error: "Pedido nao encontrado" } };
      }

      const pedido = pedidoSnap.data() ?? {};
      if (pedido.clientId !== userDocId) {
        return { status: 403, body: { error: "Pedido nao pertence a esta conta" } };
      }

      const statusAtual = cleanStatus(pedido.currentPurchaseStatus);
      const paymentProvider = typeof pedido.paymentProvider === "string" ? pedido.paymentProvider : null;
      const statusListAtual = Array.isArray(pedido.statusList) ? pedido.statusList : [];
      const requestRef = pedidoRef.collection("solicitacoesCancelamento").doc();

      if (isAutomaticCancelStatus(statusAtual)) {
        const novoStatus = "PurchaseStatus.canceled";
        transaction.update(pedidoRef, {
          currentPurchaseStatus: novoStatus,
          paymentStatus: "canceled",
          cancelReason: motivo || "Cancelado pelo cliente antes da confirmacao do pagamento",
          cancelRequestedAt: now,
          canceledAt: now,
          updatedAt: now,
          statusList: [...statusListAtual, { purchaseStatus: novoStatus, createdAt: now }],
        });
        transaction.set(requestRef, {
          tipo: "cancelamento_local",
          status: "completed",
          motivo,
          pagamento: paymentProvider,
          criadoEm: now,
        });
        return { status: 200, body: { success: true, action: "canceled", message: "Pedido cancelado." } };
      }

      if (isRefundRequestStatus(statusAtual)) {
        const novoStatus = paymentProvider === "safrapay"
          ? "PurchaseStatus.refundRequested"
          : "PurchaseStatus.canceled";
        transaction.update(pedidoRef, {
          currentPurchaseStatus: novoStatus,
          refundStatus: paymentProvider === "safrapay" ? "requested" : null,
          cancelReason: motivo || "Cancelamento solicitado pelo cliente",
          refundRequestedAt: paymentProvider === "safrapay" ? now : null,
          cancelRequestedAt: now,
          updatedAt: now,
          statusList: [...statusListAtual, { purchaseStatus: novoStatus, createdAt: now }],
        });
        transaction.set(requestRef, {
          tipo: paymentProvider === "safrapay" ? "solicitacao_reembolso" : "cancelamento",
          status: paymentProvider === "safrapay" ? "requested" : "completed",
          motivo,
          pagamento: paymentProvider,
          criadoEm: now,
        });
        return {
          status: 200,
          body: {
            success: true,
            action: paymentProvider === "safrapay" ? "refundRequested" : "canceled",
            message: paymentProvider === "safrapay"
              ? "Solicitacao de reembolso enviada para analise."
              : "Pedido cancelado.",
          },
        };
      }

      if (isSupportRequestStatus(statusAtual)) {
        transaction.update(pedidoRef, {
          cancelRequestStatus: "requested",
          cancelReason: motivo || "Cancelamento solicitado pelo cliente",
          cancelRequestedAt: now,
          updatedAt: now,
        });
        transaction.set(requestRef, {
          tipo: "solicitacao_cancelamento_atendimento",
          status: "requested",
          motivo,
          pagamento: paymentProvider,
          criadoEm: now,
        });
        return {
          status: 200,
          body: {
            success: true,
            action: "supportRequested",
            message: "Solicitacao enviada para atendimento da loja.",
          },
        };
      }

      return {
        status: 409,
        body: { error: "Este pedido nao permite cancelamento pelo cliente neste status." },
      };
    });

    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    console.error("Erro ao processar acao do pedido:", error);
    return NextResponse.json({ error: "Erro interno ao processar pedido" }, { status: 500 });
  }
}
