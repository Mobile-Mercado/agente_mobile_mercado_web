import { NextRequest, NextResponse } from "next/server";
import { createAdminSessionCookie } from "@/lib/apiAuth";

export async function POST(req: NextRequest) {
  const { senha } = await req.json();
  const correta = process.env.ADMIN_SECRET;

  if (!correta || senha !== correta) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  return createAdminSessionCookie(NextResponse.json({ ok: true }));
}
