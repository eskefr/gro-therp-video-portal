import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getServerEnv } from "@/lib/env";

let client: SupabaseClient | null = null;

export function createAdminClient(): SupabaseClient {
  if (client) return client;

  const { supabaseUrl, supabaseSecretKey } = getServerEnv();
  client = createClient(supabaseUrl, supabaseSecretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  return client;
}
