import { NextRequest, NextResponse } from "next/server";
import { requireUserDocOwner } from "@/lib/apiAuth";
import { getAdminDb } from "@/lib/firebaseAdmin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { userId, subscription } = await req.json();

    if (!userId || !subscription?.endpoint) {
      return NextResponse.json({ error: "Dados invalidos." }, { status: 400 });
    }

    const authResult = await requireUserDocOwner(req, userId);
    if (!authResult.ok) return authResult.response;

    const db = getAdminDb();
    if (!db) {
      return NextResponse.json({ error: "firebase-admin-unavailable" }, { status: 503 });
    }

    await db
      .collection("Users")
      .doc(userId)
      .collection("pushSubscription")
      .doc("default")
      .set({ ...subscription, updatedAt: new Date().toISOString() }, { merge: true });

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro interno.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
