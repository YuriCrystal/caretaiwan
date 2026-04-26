"use server";

import { auth } from "@/auth";
import { pushMessage, isLineBotEnabled } from "@/lib/line-bot";
import { getPairingsByOwner } from "@/lib/pairing";

type RecordType = "temp" | "stool" | "sleep" | "fall" | "med" | "meal" | "alert";

const TYPE_LABEL: Record<RecordType, { icon: string; label: string }> = {
  temp:  { icon: "🌡️", label: "體溫記錄" },
  stool: { icon: "💩", label: "排便記錄" },
  sleep: { icon: "😴", label: "睡眠記錄" },
  fall:  { icon: "🤕", label: "跌倒記錄" },
  med:   { icon: "💊", label: "吃藥記錄" },
  meal:  { icon: "🍚", label: "用餐記錄" },
  alert: { icon: "🚨", label: "緊急情況" },
};

export async function pushRecordToFamily(input: {
  elderId: string;
  elderName?: string;
  recordType: RecordType;
  value?: string;
  note?: string;
  timestamp: number;
}): Promise<{ ok: boolean; reason?: string }> {
  if (!isLineBotEnabled()) return { ok: false, reason: "BOT_DISABLED" };
  const session = await auth();
  const lineUserId = (session?.user as { lineUserId?: string } | undefined)?.lineUserId;
  if (!lineUserId) return { ok: false, reason: "NOT_LOGGED_IN" };

  const pairings = await getPairingsByOwner(lineUserId);
  const target = pairings.find(
    (p) => p.elder_id === input.elderId && p.paired_line_user_id
  );
  if (!target) return { ok: false, reason: "NOT_PAIRED" };

  const meta = TYPE_LABEL[input.recordType];
  const lines: string[] = [];
  lines.push(`【${input.elderName ?? "老人"} ${meta.icon} ${meta.label}】`);
  if (input.recordType === "temp" && input.value) {
    lines.push(`🌡️ ${input.value}°C`);
  }
  if (input.note) {
    lines.push(`💬 看護備註：${input.note}`);
  }
  lines.push("");
  lines.push(
    `📅 ${new Date(input.timestamp).toLocaleString("zh-TW", { hour12: false })}`
  );
  lines.push("─────────────");
  lines.push("緊急狀況請撥 119");

  const result = await pushMessage(target.paired_line_user_id!, [
    { type: "text", text: lines.join("\n") },
  ]);
  return { ok: result.ok, reason: result.ok ? undefined : `LINE_${result.status}` };
}
