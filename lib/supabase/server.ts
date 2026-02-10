import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

import {
  NEXT_PUBLIC_SUPABASE_URL,
  getSupabaseServiceRoleKey,
} from "@/lib/env";
import type { Database } from "@/lib/supabase/types";

let _client: SupabaseClient<Database> | null = null;

// Server-only Supabase client. Uses service role (bypasses RLS).
export function supabaseServer(): SupabaseClient<Database> {
  if (_client) return _client;
  _client = createClient<Database>(
    NEXT_PUBLIC_SUPABASE_URL,
    getSupabaseServiceRoleKey(),
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    },
  );
  return _client;
}

