function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing environment variable: ${name}`);
  return v;
}

function requiredNonPlaceholder(name: string, placeholders: string[]): string {
  const v = required(name);
  if (placeholders.includes(v)) {
    throw new Error(
      `Environment variable ${name} is still a placeholder. Update .env.local.`,
    );
  }
  return v;
}

export const NEXT_PUBLIC_SUPABASE_URL = required("NEXT_PUBLIC_SUPABASE_URL");
export const NEXT_PUBLIC_SUPABASE_ANON_KEY = required(
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
);

// Server-only (functions so builds don't fail with placeholders)
// Prefers SUPABASE_SERVICE_ROLE_KEY_NEW (the party project's secret key) and
// falls back to SUPABASE_SERVICE_ROLE_KEY when it isn't set.
export function getSupabaseServiceRoleKey(): string {
  const placeholders = ["YOUR_SERVICE_ROLE_KEY"];
  if (process.env.SUPABASE_SERVICE_ROLE_KEY_NEW) {
    return requiredNonPlaceholder("SUPABASE_SERVICE_ROLE_KEY_NEW", placeholders);
  }
  return requiredNonPlaceholder("SUPABASE_SERVICE_ROLE_KEY", placeholders);
}

export function getAppPasscode(): string {
  return requiredNonPlaceholder("APP_PASSCODE", ["CHANGE_ME"]);
}

export function getSessionSigningSecret(): string {
  return requiredNonPlaceholder("SESSION_SIGNING_SECRET", ["CHANGE_ME"]);
}

