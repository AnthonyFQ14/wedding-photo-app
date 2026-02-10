import { cookies } from "next/headers";

import { SESSION_COOKIE_NAME, verifySessionCookieValue } from "@/lib/session";

export async function requireSession(): Promise<{ ok: true } | { ok: false }> {
  const c = await cookies();
  const value = c.get(SESSION_COOKIE_NAME)?.value;
  const verified = verifySessionCookieValue(value);
  return verified.valid ? { ok: true } : { ok: false };
}

/** For server components: get auth status without throwing. */
export async function getSessionStatus(): Promise<{ authenticated: boolean }> {
  const session = await requireSession();
  return { authenticated: session.ok };
}

