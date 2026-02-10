import { createClient } from "@supabase/supabase-js";

import {
  NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_SUPABASE_URL,
} from "@/lib/env";
import type { Database } from "@/lib/supabase/types";

// Optional: browser Supabase client (not used by default in this project).
export const supabaseBrowser = createClient<Database>(
  NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

