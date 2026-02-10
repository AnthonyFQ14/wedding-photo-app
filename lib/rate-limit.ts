/**
 * Simple in-memory rate limiter for API routes.
 * In serverless (e.g. Vercel), this is per-instance; for strict limits across
 * all instances, use Upstash Redis or Vercel KV in production.
 */

const store = new Map<string, { count: number; resetAt: number }>();
const CLEAN_INTERVAL_MS = 60_000;

function clean() {
  const now = Date.now();
  for (const [key, v] of store.entries()) {
    if (v.resetAt <= now) store.delete(key);
  }
}

if (typeof setInterval !== "undefined") {
  setInterval(clean, CLEAN_INTERVAL_MS);
}

export type RateLimitResult =
  | { ok: true; remaining: number }
  | { ok: false; retryAfterSeconds: number };

/**
 * Check rate limit for a key (e.g. IP or session id).
 * @param key - Unique key to limit (e.g. IP address)
 * @param windowSeconds - Time window in seconds
 * @param maxAttempts - Max attempts per window
 */
export function checkRateLimit(
  key: string,
  windowSeconds: number,
  maxAttempts: number,
): RateLimitResult {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry) {
    store.set(key, {
      count: 1,
      resetAt: now + windowSeconds * 1000,
    });
    return { ok: true, remaining: maxAttempts - 1 };
  }

  if (now >= entry.resetAt) {
    store.set(key, {
      count: 1,
      resetAt: now + windowSeconds * 1000,
    });
    return { ok: true, remaining: maxAttempts - 1 };
  }

  entry.count += 1;
  if (entry.count > maxAttempts) {
    return {
      ok: false,
      retryAfterSeconds: Math.ceil((entry.resetAt - now) / 1000),
    };
  }
  return { ok: true, remaining: maxAttempts - entry.count };
}
