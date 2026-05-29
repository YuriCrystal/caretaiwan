// Supabase keep-alive endpoint
// 每 5 天從 cron-job.org 之類的服務 ping 一次,避免 Free tier 7 天閒置自動暫停。
// 一定要打 Supabase (不只是 Next.js),所以做一筆極輕量的 SELECT。
import { NextResponse } from "next/server";
import { getSupabaseAdmin, isCloudEnabled } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!isCloudEnabled()) {
    return NextResponse.json(
      { ok: false, reason: "cloud_disabled" },
      { status: 503 }
    );
  }
  const sb = getSupabaseAdmin();
  if (!sb) {
    return NextResponse.json(
      { ok: false, reason: "no_admin_client" },
      { status: 503 }
    );
  }

  try {
    // 極輕量 query — 只是讓 Supabase 看到一筆 read,重置閒置計時器
    const { error } = await sb
      .from("cloud_backups")
      .select("line_user_id", { count: "exact", head: true })
      .limit(1);

    if (error) {
      return NextResponse.json(
        { ok: false, reason: "db_error", message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    return NextResponse.json(
      {
        ok: false,
        reason: "exception",
        message: e instanceof Error ? e.message : "unknown",
      },
      { status: 500 }
    );
  }
}
