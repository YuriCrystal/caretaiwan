import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSupabaseAdmin, isCloudEnabled } from "@/lib/supabase-server";
import { checkSameOriginGet } from "@/lib/origin-check";
import { logAudit, getActorIp } from "@/lib/audit";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const ip = getActorIp(req);
  // GET 回傳完整雲端備份(特種個資)-> 同源檢查
  const csrf = checkSameOriginGet(req);
  if (csrf) {
    logAudit({ action: "FORBIDDEN_ORIGIN", actorIp: ip, resourceType: "cloud_backup", status: "forbidden" });
    return csrf;
  }
  if (!isCloudEnabled()) {
    return NextResponse.json({ error: "雲端服務未啟用" }, { status: 503 });
  }
  const session = await auth();
  const lineUserId = (session?.user as { lineUserId?: string } | undefined)?.lineUserId;
  if (!lineUserId) {
    return NextResponse.json({ error: "未登入" }, { status: 401 });
  }
  const supabase = getSupabaseAdmin()!;
  const { data, error } = await supabase
    .from("cloud_backups")
    .select("data, updated_at")
    .eq("line_user_id", lineUserId)
    .maybeSingle();

  if (error) {
    console.error("[cloud/download]", error.message);
    logAudit({
      action: "CLOUD_DOWNLOAD",
      actorLineUserId: lineUserId,
      actorIp: ip,
      resourceType: "cloud_backup",
      status: "fail",
    });
    return NextResponse.json({ error: "伺服器錯誤" }, { status: 500 });
  }
  logAudit({
    action: "CLOUD_DOWNLOAD",
    actorLineUserId: lineUserId,
    actorIp: ip,
    resourceType: "cloud_backup",
    status: "ok",
  });
  if (!data) return NextResponse.json({ data: null, updatedAt: null });
  return NextResponse.json({ data: data.data, updatedAt: data.updated_at });
}
