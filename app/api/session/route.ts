import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";

import { sanitizeApiError } from "@/lib/api-error";
import { getAppPasscode } from "@/lib/env";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  createSessionCookieValue,
  SESSION_COOKIE_NAME,
  verifySessionCookieValue,
} from "@/lib/session";

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days
const PASSCODE_RATE_WINDOW_SECONDS = 60;
const PASSCODE_MAX_ATTEMPTS = 5;

async function getClientIdentifier(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  const realIp = h.get("x-real-ip");
  const ip = forwarded?.split(",")[0]?.trim() ?? realIp ?? "unknown";
  return `session:${ip}`;
}

export async function GET() {
  const c = await cookies();
  const value = c.get(SESSION_COOKIE_NAME)?.value;
  const verified = verifySessionCookieValue(value);
  return NextResponse.json({ authenticated: verified.valid });
}

export async function POST(req: Request) {
  const key = await getClientIdentifier();
  const limit = checkRateLimit(
    key,
    PASSCODE_RATE_WINDOW_SECONDS,
    PASSCODE_MAX_ATTEMPTS,
  );
  if (!limit.ok) {
    return NextResponse.json(
      {
        error: "Too many attempts. Please try again later.",
        retryAfterSeconds: limit.retryAfterSeconds,
      },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSeconds) },
      },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  let passcode = "";
  if (body && typeof body === "object") {
    const rec = body as Record<string, unknown>;
    if (typeof rec.passcode === "string") passcode = rec.passcode;
  }

  if (!passcode || passcode !== getAppPasscode()) {
    return NextResponse.json(
      { error: sanitizeApiError("Invalid passcode", "Invalid passcode") },
      { status: 401 },
    );
  }

  const c = await cookies();
  c.set({
    name: SESSION_COOKIE_NAME,
    value: createSessionCookieValue(SESSION_TTL_SECONDS),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const c = await cookies();
  c.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
  return NextResponse.json({ ok: true });
}

