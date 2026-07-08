import { NextResponse } from "next/server";

function isSupabaseAuthEnabled() {
  return (
    process.env.AUTH_MODE === "supabase" &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  );
}

export async function GET() {
  return NextResponse.json({ enabled: isSupabaseAuthEnabled() });
}
