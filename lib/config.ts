export const APP_NAME = "Taylor & Alexander";

// You can edit these without redeploying DB changes.
export const COUPLE_NAMES = "Taylor and Alexander";

// Party details shown on the home screen (mirrors the invitation).
export const EVENT = {
  kind: "engagement party",
  dateLine: "Saturday | November 14th | 7PM",
  venue: "YOLO O Lounge",
  city: "Fort Lauderdale, FL",
};

// Photos for this event live under their own folder, so this edition can share
// a Supabase project with the wedding app without the galleries mixing.
export const PHOTO_FOLDER = "engagement-taylor-alexander";

// Uses PARTY_* names (not WEDDING_*) so the wedding app's env vars,
// which preview deployments inherit, don't override the party date.
export const WEDDING_DATE_ISO =
  process.env.PARTY_DATE ?? "2026-11-14T19:00:00-05:00";
export const REVEAL_AFTER_HOURS = Number(
  process.env.PARTY_REVEAL_AFTER_HOURS ?? "24",
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

