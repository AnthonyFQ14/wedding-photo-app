export function getErrorMessage(
  value: unknown,
  fallback: string = "Something went wrong",
): string {
  if (typeof value === "string") return value;
  if (!value || typeof value !== "object") return fallback;

  const rec = value as Record<string, unknown>;
  const err = rec["error"];
  if (typeof err === "string") return err;

  const msg = rec["message"];
  if (typeof msg === "string") return msg;

  return fallback;
}

