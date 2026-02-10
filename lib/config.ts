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

// When VAULT_TEST_SECONDS is set, we cache the reveal time so the countdown
// can reach zero and the vault actually unlocks (otherwise each request would
// return "now + N seconds" and it would never unlock).
let cachedTestRevealAt: Date | null = null;

export function getRevealAt(): Date {
  const testSeconds = process.env.VAULT_TEST_SECONDS;
  if (testSeconds !== undefined && testSeconds !== "") {
    const sec = Number(testSeconds);
    if (Number.isFinite(sec) && sec > 0) {
      if (!cachedTestRevealAt) {
        cachedTestRevealAt = new Date(Date.now() + sec * 1000);
      }
      return cachedTestRevealAt;
    }
  }
  const weddingDate = getWeddingDate();
  return new Date(weddingDate.getTime() + REVEAL_AFTER_HOURS * 60 * 60 * 1000);
}

