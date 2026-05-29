// 照片擁有權 metadata（v55, codex HIGH-2 修補）
// 配對使用者可請 server 對任意 storage path 簽 signed URL，
// 因此每張 record-photos 上傳時都要登記 metadata，
// push / expense-push 在簽 URL 前要查驗 actor + elder + purpose 三者吻合。
import { getSupabaseAdmin } from "./supabase-server";

export type PhotoPurpose = "record" | "expense";

export async function insertPhotoMetadata(input: {
  path: string;
  uploaderLineUserId: string;
  elderId: string;
  purpose: PhotoPurpose;
}): Promise<{ ok: boolean }> {
  const sb = getSupabaseAdmin();
  if (!sb) return { ok: false };
  const { error } = await sb.from("record_photos").insert({
    path: input.path,
    uploader_line_user_id: input.uploaderLineUserId,
    elder_id: input.elderId,
    purpose: input.purpose,
  });
  if (error) return { ok: false };
  return { ok: true };
}

/**
 * 驗證 path 真的屬於此 actor、此 elder、此用途。
 * Legacy（v55 前上傳、沒 metadata 的）一律回 false；
 * 呼叫者應該 skip 照片，不要 fail 整個 push。
 */
export async function verifyPhotoOwnership(input: {
  path: string;
  actorLineUserId: string;
  elderId: string;
  purpose: PhotoPurpose;
}): Promise<boolean> {
  const sb = getSupabaseAdmin();
  if (!sb) return false;
  const { data } = await sb
    .from("record_photos")
    .select("uploader_line_user_id, elder_id, purpose")
    .eq("path", input.path)
    .maybeSingle();
  if (!data) return false;
  return (
    data.uploader_line_user_id === input.actorLineUserId &&
    data.elder_id === input.elderId &&
    data.purpose === input.purpose
  );
}
