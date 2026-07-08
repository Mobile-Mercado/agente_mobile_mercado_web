import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAdminAuth } from "@/lib/firebaseAdmin";
import { validatePhone } from "@/lib/validation";

function isSupabaseAuthEnabled() {
  return (
    process.env.AUTH_MODE === "supabase" &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  );
}

export async function POST(req: Request) {
  if (!isSupabaseAuthEnabled()) {
    return NextResponse.json({ error: "supabase-auth-disabled" }, { status: 404 });
  }

  let body: { phone?: string; code?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid-json" }, { status: 400 });
  }

  const phone = validatePhone(body.phone ?? "");
  const code = String(body.code ?? "").trim();

  if (!phone) {
    return NextResponse.json({ error: "invalid-phone" }, { status: 400 });
  }
  if (!/^\d{6}$/.test(code)) {
    return NextResponse.json({ error: "invalid-code" }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase.auth.verifyOtp({
    phone,
    token: code,
    type: "sms",
  });

  if (error || !data.session) {
    console.error("[SupabaseAuth] Código inválido:", error);
    return NextResponse.json({ error: "invalid-code" }, { status: 401 });
  }

  // Encerra a sessão do Supabase imediatamente — só usamos o Supabase pra
  // validar o SMS. Quem mantém o usuário logado de verdade é o Firebase.
  await supabase.auth.signOut().catch(() => {});

  const adminAuth = getAdminAuth();
  if (!adminAuth) {
    return NextResponse.json({ error: "firebase-admin-unavailable" }, { status: 500 });
  }

  try {
    let userRecord;
    try {
      userRecord = await adminAuth.getUserByPhoneNumber(phone);
    } catch (err: unknown) {
      const authErr = err as { code?: string };
      if (authErr.code !== "auth/user-not-found") throw err;
      userRecord = await adminAuth.createUser({ phoneNumber: phone });
    }

    const token = await adminAuth.createCustomToken(userRecord.uid, {
      phoneAuthProvider: "supabase",
      phoneNumber: phone,
    });

    return NextResponse.json({ token });
  } catch (err) {
    console.error("[SupabaseAuth] Erro ao criar custom token:", err);
    return NextResponse.json({ error: "token-error" }, { status: 500 });
  }
}
