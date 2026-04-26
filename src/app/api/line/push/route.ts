// Caregiver-side calls this to push a record to family via LINE Bot
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isLineBotEnabled, pushMessage } from "@/lib/line-bot";
import { getPairingsByOwner } from "@/lib/pairing";
import { getSupabaseAdmin } from "@/lib/supabase-server";

export const runtime = "nodejs";

type PushBody = {
  elderId: string;
  elderName?: string;
  recordType: "temp" | "stool" | "sleep" | "fall" | "med" | "meal" | "alert";
  value?: string;
  note?: string;
  timestamp: number;
};

const TYPE_LABEL: Record<PushBody["recordType"], { icon: string; label: string }> = {
  temp:  { icon: "🌡️", label: "體溫記錄" },
  stool: { icon: "💩", label: "排便記錄" },
  sleep: { icon: "😴", label: "睡眠記錄" },
  fall:  { icon: "🤕", label: "跌倒記錄" },
  med:   { icon: "💊", label: "吃藥記錄" },
  meal:  { icon: "🍚", label: "用餐記錄" },
  alert: { icon: "🚨", label: "緊急情況" },
};

function formatMessage(body: PushBody): string {
  const meta = TYPE_LABEL[body.recordType];
  const lines: string[] = [];
  lines.push(`【${body.elderName ?? "老人"} ${meta.icon} ${meta.label}】`);
  if (body.recordType === "temp" && body.value) {
    lines.push(`🌡️ ${body.value}°C`);
  }
  if (body.note) {
    lines.push(`💬 看護備註：${body.note}`);
  }
  lines.push("");
  lines.push(`📅 ${new Date(body.timestamp).toLocaleString("zh-TW", { hour12: false })}`);
  lines.push("─────────────");
  lines.push("緊急狀況請撥 119");
  return lines.join("\n");
}

export async function POST(req: Request) {
  if (!isLineBotEnabled()) {
    return NextResponse.json(
      { error: "LINE Bot 尚未啟用" },
      { status: 503 }
    );
  }
  const session = await auth();
  const lineUserId = (session?.user as { lineUserId?: string } | undefined)?.lineUserId;
  if (!lineUserId) {
    return NextResponse.json({ error: "未登入" }, { status: 401 });
  }

  const body = (await req.json()) as PushBody;
  if (!body.elderId || !body.recordType || !body.timestamp) {
    return NextResponse.json({ error: "缺少欄位" }, { status: 400 });
  }

  // Find pairings for this caregiver
  const pairings = await getPairingsByOwner(lineUserId);
  const target = pairings.find(
    (p) => p.elder_id === body.elderId && p.paired_line_user_id
  );
  if (!target) {
    return NextResponse.json(
      { ok: false, error: "尚未配對家屬", elderId: body.elderId },
      { status: 200 }
    );
  }

  const text = formatMessage(body);
  const result = await pushMessage(target.paired_line_user_id!, [
    { type: "text", text },
  ]);

  // Log push (optional best-effort)
  const sb = getSupabaseAdmin();
  if (sb) {
    sb.from("push_logs")
      .insert({
        elder_id: body.elderId,
        line_user_id: target.paired_line_user_id,
        message: text,
        status: result.ok ? "sent" : `error_${result.status}`,
      })
      .then(() => {});
  }

  return NextResponse.json({ ok: result.ok, status: result.status });
}
