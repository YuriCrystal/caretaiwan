// 記帳本資料層 - 看護記、家屬查、可核帳
import { getSupabaseAdmin } from "./supabase-server";

export type ExpenseCategory = "med" | "supply" | "food" | "medical" | "other";
export type ExpenseVerifyStatus = "pending" | "confirmed" | "disputed";

export type ExpenseLog = {
  id: number;
  elder_id: string;
  actor_line_user_id: string;
  owner_line_user_id: string;
  item_name: string;
  amount: number;
  category: ExpenseCategory;
  note: string | null;
  photo_path: string | null;
  verify_status: ExpenseVerifyStatus;
  verify_note: string | null;
  verified_at: string | null;
  created_at: string;
};

// 安全範圍:防止 NaN / 太大金額 / 負數 / 太小於 0.01
export function sanitizeAmount(raw: unknown): number | null {
  if (typeof raw === "number" && !isNaN(raw)) {
    if (raw < 0 || raw > 9999999) return null; // 上限 999.9 萬
    return Math.round(raw * 100) / 100; // 截 2 位小數
  }
  if (typeof raw === "string") {
    const n = parseFloat(raw);
    if (isNaN(n)) return null;
    return sanitizeAmount(n);
  }
  return null;
}

export function isValidCategory(c: unknown): c is ExpenseCategory {
  return c === "med" || c === "supply" || c === "food" || c === "medical" || c === "other";
}

/**
 * 看護建立記帳
 */
export async function createExpense(input: {
  elderId: string;
  actorLineUserId: string;
  ownerLineUserId: string;
  itemName: string;
  amount: number;
  category: ExpenseCategory;
  note?: string;
  photoPath?: string;
}): Promise<{ ok: boolean; expense?: ExpenseLog; error?: string }> {
  const sb = getSupabaseAdmin();
  if (!sb) return { ok: false, error: "SERVICE_DISABLED" };

  const { data, error } = await sb
    .from("expense_logs")
    .insert({
      elder_id: input.elderId,
      actor_line_user_id: input.actorLineUserId,
      owner_line_user_id: input.ownerLineUserId,
      item_name: input.itemName.slice(0, 100),
      amount: input.amount,
      category: input.category,
      note: input.note?.slice(0, 500) ?? null,
      photo_path: input.photoPath ?? null,
    })
    .select()
    .maybeSingle();

  if (error) return { ok: false, error: "DB_ERROR" };
  if (!data) return { ok: false, error: "INSERT_FAILED" };
  return { ok: true, expense: data };
}

/**
 * 列出某張卡的記帳。
 * Security: caller 必須是這張卡的**當前 pairing**角色才看得到
 *           (owner 或 paired,不能用「曾經是 actor」-> 防止舊看護解綁後仍看到舊雇主帳)
 * 用兩次 query (不用 .or() 字串拼接 -> 防 PostgREST filter injection)
 */
export async function listExpensesForCard(
  elderId: string,
  callerLineUserId: string,
  limit = 50
): Promise<{ ok: boolean; expenses?: ExpenseLog[]; error?: string }> {
  const sb = getSupabaseAdmin();
  if (!sb) return { ok: false, error: "SERVICE_DISABLED" };

  // 先驗證 caller 是當前 pairing 的 owner 或 paired_line_user_id
  const { data: pairing } = await sb
    .from("elder_pairings")
    .select("owner_line_user_id, paired_line_user_id")
    .eq("elder_id", elderId)
    .maybeSingle();

  if (!pairing) return { ok: true, expenses: [] };
  const isOwner = pairing.owner_line_user_id === callerLineUserId;
  const isPaired = pairing.paired_line_user_id === callerLineUserId;
  if (!isOwner && !isPaired) {
    // 非當前 pairing 角色一律拒絕(就算 DB 有舊紀錄也看不到)
    return { ok: true, expenses: [] };
  }

  const { data, error } = await sb
    .from("expense_logs")
    .select("*")
    .eq("elder_id", elderId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return { ok: false, error: "DB_ERROR" };
  return { ok: true, expenses: data ?? [] };
}

/**
 * 家屬核帳:確認 or 標記有問題
 * Security: 只有 owner 可核
 */
export async function verifyExpense(
  expenseId: number,
  ownerLineUserId: string,
  status: "confirmed" | "disputed",
  note?: string
): Promise<{ ok: boolean; expense?: ExpenseLog; error?: string }> {
  const sb = getSupabaseAdmin();
  if (!sb) return { ok: false, error: "SERVICE_DISABLED" };

  const { data, error } = await sb
    .from("expense_logs")
    .update({
      verify_status: status,
      verify_note: note?.slice(0, 500) ?? null,
      verified_at: new Date().toISOString(),
    })
    .eq("id", expenseId)
    .eq("owner_line_user_id", ownerLineUserId)
    .select()
    .maybeSingle();

  if (error) return { ok: false, error: "DB_ERROR" };
  if (!data) return { ok: false, error: "NOT_FOUND_OR_NOT_OWNER" };
  return { ok: true, expense: data };
}

// 分類顯示用(server side push 訊息也會用)
export const CATEGORY_META: Record<ExpenseCategory, { icon: string; labelZh: string }> = {
  med: { icon: "💊", labelZh: "藥品" },
  supply: { icon: "🧻", labelZh: "用品" },
  food: { icon: "🍎", labelZh: "食品" },
  medical: { icon: "🏥", labelZh: "醫療" },
  other: { icon: "📦", labelZh: "其他" },
};
