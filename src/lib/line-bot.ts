// LINE Messaging API helpers (Bot for family-side push notifications)
// Server-side only.
import crypto from "crypto";

const CHANNEL_SECRET = process.env.LINE_BOT_CHANNEL_SECRET;
const ACCESS_TOKEN = process.env.LINE_BOT_CHANNEL_ACCESS_TOKEN;

export function isLineBotEnabled(): boolean {
  return Boolean(CHANNEL_SECRET && ACCESS_TOKEN);
}

/** Verify webhook signature from LINE platform */
export function verifyLineSignature(
  body: string,
  signature: string | null
): boolean {
  if (!signature || !CHANNEL_SECRET) return false;
  const expected = crypto
    .createHmac("sha256", CHANNEL_SECRET)
    .update(body)
    .digest("base64");
  // constant-time compare
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

type LineMessage =
  | { type: "text"; text: string }
  | { type: "flex"; altText: string; contents: unknown };

export async function pushMessage(
  toUserId: string,
  messages: LineMessage[]
): Promise<{ ok: boolean; status: number; body?: unknown }> {
  if (!ACCESS_TOKEN) return { ok: false, status: 0, body: "BOT_DISABLED" };
  const res = await fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ACCESS_TOKEN}`,
    },
    body: JSON.stringify({ to: toUserId, messages }),
  });
  let body: unknown = undefined;
  try {
    body = await res.json();
  } catch {}
  return { ok: res.ok, status: res.status, body };
}

export async function replyMessage(
  replyToken: string,
  messages: LineMessage[]
): Promise<{ ok: boolean; status: number; body?: unknown }> {
  if (!ACCESS_TOKEN) return { ok: false, status: 0, body: "BOT_DISABLED" };
  const res = await fetch("https://api.line.me/v2/bot/message/reply", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ACCESS_TOKEN}`,
    },
    body: JSON.stringify({ replyToken, messages }),
  });
  let body: unknown = undefined;
  try {
    body = await res.json();
  } catch {}
  return { ok: res.ok, status: res.status, body };
}
