import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
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

  let body: { phone?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid-json" }, { status: 400 });
  }

  const phone = validatePhone(body.phone ?? "");
  if (!phone) {
    return NextResponse.json({ error: "invalid-phone" }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { error } = await supabase.auth.signInWithOtp({ phone });
  if (error) {
    console.error("[SupabaseAuth] Erro ao enviar código:", error);
    return NextResponse.json(
      { error: "supabase-send-code-failed", message: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
