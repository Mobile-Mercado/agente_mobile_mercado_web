import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { admin, getAdminAuth, getAdminDb } from "@/lib/firebaseAdmin";
import crypto from "crypto";

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const rateLimitStore = new Map<string, RateLimitEntry>();
const ADMIN_SESSION_COOKIE = "agente_admin_session";
const ADMIN_SESSION_TTL_MS = 12 * 60 * 60 * 1000;

export type ApiAuthUser = {
  uid: string;
  phoneNumber?: string;
  email?: string;
};

export function getBearerToken(request: NextRequest): string {
  const authHeader = request.headers.get("authorization") || "";
  return authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
}

export async function requireFirebaseAuth(request: NextRequest): Promise<
  | { ok: true; user: ApiAuthUser }
  | { ok: false; response: NextResponse }
> {
  const token = getBearerToken(request);
  if (!token) {
    return {
      ok: false,
      response: NextResponse.json({ error: "auth-required" }, { status: 401 }),
    };
  }

  const adminAuth = getAdminAuth();
  if (!adminAuth) {
    return {
      ok: false,
      response: NextResponse.json({ error: "firebase-admin-unavailable" }, { status: 503 }),
    };
  }

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    return {
      ok: true,
      user: {
        uid: decoded.uid,
        phoneNumber: decoded.phone_number,
        email: decoded.email,
      },
    };
  } catch {
    return {
      ok: false,
      response: NextResponse.json({ error: "invalid-auth-token" }, { status: 401 }),
    };
  }
}

export async function requireUserDocOwner(
  request: NextRequest,
  userDocId: string,
): Promise<
  | { ok: true; user: ApiAuthUser }
  | { ok: false; response: NextResponse }
> {
  if (!userDocId || typeof userDocId !== "string") {
    return {
      ok: false,
      response: NextResponse.json({ error: "userDocId-required" }, { status: 400 }),
    };
  }

  const authResult = await requireFirebaseAuth(request);
  if (!authResult.ok) return authResult;

  const db = getAdminDb();
  if (!db) {
    return {
      ok: false,
      response: NextResponse.json({ error: "firebase-admin-unavailable" }, { status: 503 }),
    };
  }

  const userSnap = await db.collection("Users").doc(userDocId).get();
  if (!userSnap.exists || userSnap.data()?.userAuthId !== authResult.user.uid) {
    return {
      ok: false,
      response: NextResponse.json({ error: "forbidden-user" }, { status: 403 }),
    };
  }

  return authResult;
}

export function enforceRateLimit(
  key: string,
  options: { limit: number; windowMs: number },
): NextResponse | null {
  const now = Date.now();
  const current = rateLimitStore.get(key);

  if (!current || current.resetAt <= now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + options.windowMs });
    return null;
  }

  if (current.count >= options.limit) {
    const retryAfterSeconds = Math.max(1, Math.ceil((current.resetAt - now) / 1000));
    return NextResponse.json(
      { error: "rate-limit-exceeded", retryAfterSeconds },
      {
        status: 429,
        headers: { "Retry-After": String(retryAfterSeconds) },
      },
    );
  }

  current.count += 1;
  return null;
}

export function getClientIp(request: NextRequest): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown-ip";
}

export function serverTimestamp() {
  return admin.firestore.FieldValue.serverTimestamp();
}

function getAdminSecret(): string {
  return process.env.ADMIN_SECRET?.trim() || "";
}

function signAdminSession(expiresAt: number): string {
  const secret = getAdminSecret();
  return crypto.createHmac("sha256", secret).update(String(expiresAt)).digest("hex");
}

export function createAdminSessionCookie(response: NextResponse) {
  const secret = getAdminSecret();
  if (!secret) return response;

  const expiresAt = Date.now() + ADMIN_SESSION_TTL_MS;
  const signature = signAdminSession(expiresAt);
  response.cookies.set(ADMIN_SESSION_COOKIE, `${expiresAt}.${signature}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: Math.floor(ADMIN_SESSION_TTL_MS / 1000),
  });
  return response;
}

export function requireAdminSession(request: NextRequest): NextResponse | null {
  const secret = getAdminSecret();
  if (!secret) {
    return NextResponse.json({ error: "admin-secret-not-configured" }, { status: 503 });
  }

  const cookieValue = request.cookies.get(ADMIN_SESSION_COOKIE)?.value || "";
  const [expiresRaw, signature] = cookieValue.split(".");
  const expiresAt = Number(expiresRaw);

  if (!Number.isFinite(expiresAt) || expiresAt <= Date.now() || !signature) {
    return NextResponse.json({ error: "admin-auth-required" }, { status: 401 });
  }

  const expected = signAdminSession(expiresAt);
  const receivedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (
    receivedBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(receivedBuffer, expectedBuffer)
  ) {
    return NextResponse.json({ error: "invalid-admin-session" }, { status: 401 });
  }

  return null;
}
