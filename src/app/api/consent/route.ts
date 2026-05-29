// 同意條款 audit endpoint - 用戶點「我已閱讀並同意」時呼叫
// 記錄同意版本 + 時間 + IP(已匿名化) + 是否同意特種個資處理
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { checkSameOrigin } from "@/lib/origin-check";
import { logAudit, getActorIp } from "@/lib/audit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const ip = getActorIp(req);
  const csrf = checkSameOrigin(req);
  if (csrf) return csrf;

  const body = (await req.json().catch(() => ({}))) as {
    version?: number;
    sensitiveDataConsent?: boolean;
    revoke?: boolean;
  };

  // 取 session 是 best-effort - 沒登入也允許記錄(用戶可能在登入前就先同意)
  const session = await auth();
  const lineUserId = (session?.user as { lineUserId?: string } | undefined)?.lineUserId;

  logAudit({
    action: body.revoke ? "AUTH_CONSENT_REVOKE" : "AUTH_CONSENT",
    actorLineUserId: lineUserId ?? null,
    actorIp: ip,
    resourceType: "consent",
    resourceId: `v${body.version ?? 0}`,
    status: "ok",
    metadata: {
      version: body.version,
      sensitiveDataConsent: !!body.sensitiveDataConsent,
    },
  });

  return NextResponse.json({ ok: true });
}
