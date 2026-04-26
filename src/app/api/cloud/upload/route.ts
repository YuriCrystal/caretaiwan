import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSupabaseAdmin, isCloudEnabled } from "@/lib/supabase-server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!isCloudEnabled()) {
    return NextResponse.json({ error: "雲端服務未啟用（管理員未設定）" }, { status: 503 });
  }
  const session = await auth();
  const lineUserId = (session?.user as { lineUserId?: string } | undefined)?.lineUserId;
  if (!lineUserId) {
    return NextResponse.json({ error: "未登入" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "格式錯誤" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin()!;
  const { error } = await supabase
    .from("cloud_backups")
    .upsert(
      {
        line_user_id: lineUserId,
        display_name: session?.user?.name ?? null,
        data: body,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "line_user_id" }
    );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
