export const APP_NAME = "Wedding Photo Vault";

// You can edit these without redeploying DB changes.
export const COUPLE_NAMES = "Anthony and Lauren";

export const WEDDING_DATE_ISO =
  process.env.WEDDING_DATE ?? "2026-02-14T17:00:00";

export const REVEAL_AFTER_HOURS = Number(
  process.env.REVEAL_AFTER_HOURS ?? "24",
);

export function getWeddingDate(): Date {
  const d = new Date(WEDDING_DATE_ISO);
  if (Number.isNaN(d.getTime())) {
    throw new Error(
      `Invalid WEDDING_DATE. Expected ISO string, got: ${WEDDING_DATE_ISO}`,
    );
  }
  return d;
}

export function getRevealAt(): Date {
  const weddingDate = getWeddingDate();
  return new Date(weddingDate.getTime() + REVEAL_AFTER_HOURS * 60 * 60 * 1000);
}

