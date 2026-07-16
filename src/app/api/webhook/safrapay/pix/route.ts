import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { admin, getAdminDb } from "@/lib/firebaseAdmin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function validateWebhookSignature(payload: string, signature: string, secret: string): boolean {
  if (!secret) return false;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(signature);

  return expectedBuffer.length === receivedBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
}

function isPaidStatus(status: unknown): boolean {
  return status === "paid" || status === "Paid" || status === 8;
}

function getEventId(request: NextRequest, event: Record<string, unknown>) {
  return request.headers.get("x-safrapay-event-id") ||
    String(event.id || event.eventId || event.transactionId || event.chargeId || crypto.randomUUID());
}

export async function POST(request: NextRequest) {
  try {
    const db = getAdminDb();
    if (!db) {
      return NextResponse.json({ error: "firebase-admin-unavailable" }, { status: 503 });
    }

    const payload = await request.text();
    const signature = request.headers.get("x-safrapay-signature") || "";
    const webhookSecret = process.env.SAFRAPAY_WEBHOOK_SECRET || "";

    if (!validateWebhookSignature(payload, signature, webhookSecret)) {
      return NextResponse.json({ error: "Assinatura invalida" }, { status: 403 });
    }

    const event = JSON.parse(payload) as Record<string, unknown>;
    const eventId = getEventId(request, event);
    const chargeId = String(event.chargeId || "");
    const transactionId = String(event.transactionId || "");
    const paidAt = typeof event.paidAt === "string" ? new Date(event.paidAt) : new Date();

    if (!isPaidStatus(event.status)) {
      return NextResponse.json({ success: true, ignored: true });
    }

    if (!transactionId && !chargeId) {
      return NextResponse.json({ error: "transactionId ou chargeId ausente" }, { status: 400 });
    }

    const baseQuery = transactionId
      ? db.collection("PurchaseRequests").where("paymentTransactionId", "==", transactionId)
      : db.collection("PurchaseRequests").where("paymentChargeId", "==", chargeId);
    const snap = await baseQuery.get();

    if (snap.empty) {
      return NextResponse.json({ error: "Pedido nao encontrado" }, { status: 404 });
    }

    const processedAt = admin.firestore.Timestamp.now();
    const paidAtTimestamp = admin.firestore.Timestamp.fromDate(paidAt);
    const pendingStatus = "PurchaseStatus.pending";
    let updatedCount = 0;
    let skippedCount = 0;

    await db.runTransaction(async (transaction) => {
      for (const orderDoc of snap.docs) {
        const fresh = await transaction.get(orderDoc.ref);
        const data = fresh.data() || {};
        const processedIds = Array.isArray(data.webhookProcessedEventIds)
          ? data.webhookProcessedEventIds
          : [];

        if (processedIds.includes(eventId)) {
          skippedCount += 1;
          continue;
        }

        const statusListAtual = Array.isArray(data.statusList) ? data.statusList : [];
        const lastStatus = statusListAtual[statusListAtual.length - 1]?.purchaseStatus;
        const nextStatusList = lastStatus === pendingStatus
          ? statusListAtual
          : [...statusListAtual, { purchaseStatus: pendingStatus, createdAt: processedAt }];

        transaction.update(orderDoc.ref, {
          currentPurchaseStatus: pendingStatus,
          statusList: nextStatusList,
          paymentStatus: "paid",
          paymentConfirmedAt: paidAtTimestamp,
          paymentChargeId: chargeId || data.paymentChargeId || null,
          webhookProcessedAt: processedAt,
          webhookLastEventId: eventId,
          webhookProcessedEventIds: admin.firestore.FieldValue.arrayUnion(eventId),
          updatedAt: processedAt,
        });
        updatedCount += 1;
      }
    });

    return NextResponse.json({ success: true, updatedCount, skippedCount });
  } catch (error) {
    console.error("Erro ao processar webhook Safrapay:", error);
    return NextResponse.json({ error: "Erro ao processar webhook" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: "active" });
}
