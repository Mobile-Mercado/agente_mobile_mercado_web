import { NextResponse } from "next/server";
import { admin, getAdminDb } from "@/lib/firebaseAdmin";
import { validatePhone } from "@/lib/validation";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Trava do lado do servidor para o envio de codigo por telefone (SMS/WhatsApp).
// Sem isso, o unico controle era o localStorage do navegador, que qualquer
// bot ou usuario com varias abas/numeros consegue ignorar.
const PHONE_COOLDOWN_MS = 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
const HOURLY_LIMIT = Number(process.env.SMS_AUTH_HOURLY_LIMIT || 30);
const DAILY_LIMIT = Number(process.env.SMS_AUTH_DAILY_LIMIT || 120);

function windowId(prefix: string, sizeMs: number) {
  return `${prefix}-${Math.floor(Date.now() / sizeMs)}`;
}

export async function POST(req: Request) {
  const db = getAdminDb();
  if (!db) {
    return NextResponse.json({ error: "server-not-configured" }, { status: 500 });
  }

  const body = await req.json().catch(() => ({}));
  const phone = validatePhone(String(body.phone ?? ""));
  if (!phone) {
    return NextResponse.json({ ok: false, reason: "invalid-phone" }, { status: 400 });
  }

  const phoneRef = db.collection("smsAuthPhoneCooldowns").doc(phone);
  const hourlyRef = db.collection("smsAuthWindows").doc(windowId("hourly", HOUR_MS));
  const dailyRef = db.collection("smsAuthWindows").doc(windowId("daily", DAY_MS));

  try {
    const result = await db.runTransaction(async (transaction) => {
      const [phoneSnap, hourlySnap, dailySnap] = await Promise.all([
        transaction.get(phoneRef),
        transaction.get(hourlyRef),
        transaction.get(dailyRef),
      ]);

      const now = Date.now();
      const nextAllowedAt = Number(phoneSnap.data()?.nextAllowedAt ?? 0);
      if (nextAllowedAt > now) {
        return { ok: false as const, reason: "cooldown" as const, retryAfterMs: nextAllowedAt - now };
      }

      const hourlyCount = Number(hourlySnap.data()?.count ?? 0);
      if (hourlyCount >= HOURLY_LIMIT) {
        return { ok: false as const, reason: "hourly-limit" as const };
      }

      const dailyCount = Number(dailySnap.data()?.count ?? 0);
      if (dailyCount >= DAILY_LIMIT) {
        return { ok: false as const, reason: "daily-limit" as const };
      }

      const updatedAt = admin.firestore.FieldValue.serverTimestamp();
      transaction.set(phoneRef, { nextAllowedAt: now + PHONE_COOLDOWN_MS, updatedAt });
      transaction.set(hourlyRef, { count: admin.firestore.FieldValue.increment(1), updatedAt }, { merge: true });
      transaction.set(dailyRef, { count: admin.firestore.FieldValue.increment(1), updatedAt }, { merge: true });

      return { ok: true as const };
    });

    if (!result.ok) {
      return NextResponse.json(result, { status: 429 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("[SmsAuthGuard] Erro ao verificar limite de envio de codigo:", error);
    return NextResponse.json({ ok: false, reason: "guard-unavailable" }, { status: 500 });
  }
}
