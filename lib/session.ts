import crypto from "crypto";

import { getSessionSigningSecret } from "@/lib/env";

export const SESSION_COOKIE_NAME = "wedding_session";

type SessionPayload = {
  v: 1;
  iat: number; // epoch seconds
  exp: number; // epoch seconds
};

function base64UrlEncode(buf: Buffer): string {
  return buf
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function base64UrlDecodeToBuffer(s: string): Buffer {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  const b64 = s.replaceAll("-", "+").replaceAll("_", "/") + pad;
  return Buffer.from(b64, "base64");
}

function sign(input: string): string {
  const h = crypto.createHmac("sha256", getSessionSigningSecret());
  h.update(input);
  return base64UrlEncode(h.digest());
}

export function createSessionCookieValue(ttlSeconds: number): string {
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = {
    v: 1,
    iat: now,
    exp: now + ttlSeconds,
  };
  const payloadB64 = base64UrlEncode(Buffer.from(JSON.stringify(payload)));
  const sig = sign(payloadB64);
  return `${payloadB64}.${sig}`;
}

export function verifySessionCookieValue(
  cookieValue: string | undefined,
): { valid: boolean; payload?: SessionPayload } {
  if (!cookieValue) return { valid: false };
  const [payloadB64, sig] = cookieValue.split(".");
  if (!payloadB64 || !sig) return { valid: false };
  const expected = sign(payloadB64);
  // Constant-time compare
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return { valid: false };
  if (!crypto.timingSafeEqual(a, b)) return { valid: false };

  let payload: SessionPayload;
  try {
    payload = JSON.parse(base64UrlDecodeToBuffer(payloadB64).toString("utf8"));
  } catch {
    return { valid: false };
  }

  if (payload?.v !== 1) return { valid: false };
  const now = Math.floor(Date.now() / 1000);
  if (typeof payload.exp !== "number" || now >= payload.exp) {
    return { valid: false };
  }

  return { valid: true, payload };
}

