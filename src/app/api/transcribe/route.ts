import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { enforceRateLimit, getClientIp, requireFirebaseAuth } from "@/lib/apiAuth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const authResult = await requireFirebaseAuth(req);
  if (!authResult.ok) return authResult.response;

  const rateLimited = enforceRateLimit(`transcribe:${authResult.user.uid}:${getClientIp(req)}`, {
    limit: 10,
    windowMs: 60 * 1000,
  });
  if (rateLimited) return rateLimited;

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "Arquivo de áudio ausente." }, { status: 400 });
  }

  const result = await openai.audio.transcriptions.create({
    file,
    model:    "whisper-1",
    language: "pt",
  });

  return NextResponse.json({ text: result.text });
}
