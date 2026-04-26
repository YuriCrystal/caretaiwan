// 配對碼產生 + Supabase 操作（看護↔家屬透過 elder 配對）
import { getSupabaseAdmin } from "./supabase-server";

// 6 位數英文+數字配對碼（去除易混淆的 0/O/1/I）
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generatePairingCode(length = 6): string {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return code;
}

export type Pairing = {
  elder_id: string;
  pairing_code: string;
  paired_line_user_id: string | null;
  paired_at: string | null;
  owner_line_user_id: string;
  display_name: string | null;
  created_at: string;
};

/** Get or create pairing for an elder owned by a caregiver */
export async function ensurePairing(
  elderId: string,
  ownerLineUserId: string,
  displayName: string | null
): Promise<{ ok: boolean; code?: string; pairing?: Pairing; error?: string }> {
  const sb = getSupabaseAdmin();
  if (!sb) return { ok: false, error: "雲端服務未啟用" };

  // Existing?
  const { data: existing } = await sb
    .from("elder_pairings")
    .select("*")
    .eq("elder_id", elderId)
    .maybeSingle();
  if (existing) {
    return { ok: true, code: existing.pairing_code, pairing: existing };
  }

  // Generate unique code (retry if collision, very rare)
  let code = generatePairingCode();
  for (let i = 0; i < 5; i++) {
    const { data: collision } = await sb
      .from("elder_pairings")
      .select("elder_id")
      .eq("pairing_code", code)
      .maybeSingle();
    if (!collision) break;
    code = generatePairingCode();
  }

  const { data, error } = await sb
    .from("elder_pairings")
    .insert({
      elder_id: elderId,
      pairing_code: code,
      owner_line_user_id: ownerLineUserId,
      display_name: displayName,
    })
    .select()
    .single();

  if (error) return { ok: false, error: error.message };
  return { ok: true, code, pairing: data };
}

/** Look up pairing by code (used when family sends code via LINE Bot) */
export async function findPairingByCode(code: string): Promise<Pairing | null> {
  const sb = getSupabaseAdmin();
  if (!sb) return null;
  const { data } = await sb
    .from("elder_pairings")
    .select("*")
    .eq("pairing_code", code.toUpperCase().trim())
    .maybeSingle();
  return data ?? null;
}

/** Bind family LINE userId to a pairing */
export async function bindFamily(
  pairingCode: string,
  familyLineUserId: string
): Promise<{ ok: boolean; pairing?: Pairing; error?: string }> {
  const sb = getSupabaseAdmin();
  if (!sb) return { ok: false, error: "雲端服務未啟用" };
  const { data, error } = await sb
    .from("elder_pairings")
    .update({
      paired_line_user_id: familyLineUserId,
      paired_at: new Date().toISOString(),
    })
    .eq("pairing_code", pairingCode.toUpperCase().trim())
    .select()
    .single();
  if (error) return { ok: false, error: error.message };
  return { ok: true, pairing: data };
}

/** Get all pairings owned by a caregiver (looked up by their LINE userId) */
export async function getPairingsByOwner(
  ownerLineUserId: string
): Promise<Pairing[]> {
  const sb = getSupabaseAdmin();
  if (!sb) return [];
  const { data } = await sb
    .from("elder_pairings")
    .select("*")
    .eq("owner_line_user_id", ownerLineUserId);
  return data ?? [];
}
