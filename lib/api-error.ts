/**
 * Return a safe error message for API responses.
 * In production, avoid leaking internal details (e.g. Supabase messages).
 */
export function sanitizeApiError(
  internalMessage: string,
  publicFallback: string = "Something went wrong",
): string {
  if (process.env.NODE_ENV === "production") {
    return publicFallback;
  }
  return internalMessage;
}
