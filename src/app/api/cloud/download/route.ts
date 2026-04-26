import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSupabaseAdmin, isCloudEnabled } from "@/lib/supabase-server";

export const runtime = "nodejs";

export async function GET() {
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

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ data: null, updatedAt: null });
  return NextResponse.json({ data: data.data, updatedAt: data.updated_at });
}
