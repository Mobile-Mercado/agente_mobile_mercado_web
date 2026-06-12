import { NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebaseAdmin";
import { validatePhone } from "@/lib/validation";

export async function POST(req: Request) {
  const enabled = process.env.PHONE_AUTH_FALLBACK_ENABLED === "true";
  const expectedCode = process.env.PHONE_AUTH_FALLBACK_CODE?.trim();

  if (!enabled || !expectedCode) {
    return NextResponse.json({ error: "fallback-disabled" }, { status: 404 });
  }

  let body: { phone?: string; code?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid-json" }, { status: 400 });
  }

  const phoneNumber = validatePhone(body.phone ?? "");
  const code = String(body.code ?? "").trim();

  if (!phoneNumber) {
    return NextResponse.json({ error: "invalid-phone" }, { status: 400 });
  }

  if (!/^\d{6}$/.test(code) || code !== expectedCode) {
    return NextResponse.json({ error: "invalid-code" }, { status: 401 });
  }

  const adminAuth = getAdminAuth();
  if (!adminAuth) {
    return NextResponse.json({ error: "firebase-admin-unavailable" }, { status: 500 });
  }

  try {
    let userRecord;
    try {
      userRecord = await adminAuth.getUserByPhoneNumber(phoneNumber);
    } catch (error: unknown) {
      const authError = error as { code?: string };
      if (authError.code !== "auth/user-not-found") throw error;
      userRecord = await adminAuth.createUser({ phoneNumber });
    }

    const token = await adminAuth.createCustomToken(userRecord.uid, {
      phoneAuthFallback: true,
      phoneNumber,
    });

    return NextResponse.json({ token });
  } catch (error) {
    console.error("[PhoneAuthFallback] Erro ao criar custom token:", error);
    return NextResponse.json({ error: "token-error" }, { status: 500 });
  }
}
