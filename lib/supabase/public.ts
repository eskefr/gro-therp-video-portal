import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getPublicEnv } from "@/lib/env";

let client: SupabaseClient | null = null;

export function createPublicClient(): SupabaseClient {
  if (client) return client;

  const { supabaseUrl, supabasePublishableKey } = getPublicEnv();
  client = createClient(supabaseUrl, supabasePublishableKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  return client;
}
