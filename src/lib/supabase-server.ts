// Supabase server-side client using service_role key.
// NEVER import this from a client component.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

let _client: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient | null {
  if (_client) return _client;
  if (!URL || !SERVICE_KEY) return null;
  _client = createClient(URL, SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _client;
}

export function isCloudEnabled(): boolean {
  return Boolean(URL && SERVICE_KEY);
}
