// Supabase client — Phase 1 可選同步，未設環境變數時 fallback localStorage only
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (_client) return _client;
  if (!URL || !KEY) return null;
  _client = createClient(URL, KEY);
  return _client;
}

export function isSupabaseEnabled(): boolean {
  return Boolean(URL && KEY);
}

// Phase 2 schema 建議：
// - elders: id, name, gender, birthday, blood_type, history, allergies, medications jsonb, doctor, hospital, contacts jsonb, owner_device, updated_at
// - records: id, elder_id, type, value, note, shared, created_at, owner_device
// 暫時只放 client；同步邏輯延後到 Phase 2
