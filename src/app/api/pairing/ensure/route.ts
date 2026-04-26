// Caregiver-side: ensure (or fetch) a pairing code for an elder
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { ensurePairing } from "@/lib/pairing";
import { isCloudEnabled } from "@/lib/supabase-server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!isCloudEnabled()) {
    return NextResponse.json({ error: "雲端服務未啟用" }, { status: 503 });
  }
  const session = await auth();
  const lineUserId = (session?.user as { lineUserId?: string } | undefined)?.lineUserId;
  if (!lineUserId) {
    return NextResponse.json({ error: "未登入" }, { status: 401 });
  }
  const body = (await req.json().catch(() => ({}))) as {
    elderId?: string;
    displayName?: string;
  };
  if (!body.elderId) {
    return NextResponse.json({ error: "缺少 elderId" }, { status: 400 });
  }
  const result = await ensurePairing(
    body.elderId,
    lineUserId,
    body.displayName ?? null
  );
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }
  return NextResponse.json({
    ok: true,
    code: result.code,
    paired: Boolean(result.pairing?.paired_line_user_id),
  });
}
