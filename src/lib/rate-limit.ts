// 速率限制器(防暴破配對碼 / 照片上傳濫用 / API 洪水)
//
// 策略:
//  - 若有設 UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN -> 走 Upstash Redis (全 Vercel instance 共用)
//  - 否則 graceful fallback 到 in-memory (單 instance,小流量夠用)
//
// Upstash Redis Free tier: 10k commands/day, 256MB,完全足夠 closed beta + 早期推廣。
//
// 設定方式:
//  1. https://console.upstash.com 註冊免費帳號
//  2. Create Database (Redis,選最近區域如 ap-southeast-1)
//  3. 拿 REST URL + REST TOKEN
//  4. Vercel env 加 UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
//  5. Redeploy

type Entry = { count: number; firstAt: number };

const memoryStore = new Map<string, Entry>();

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const HAS_UPSTASH = Boolean(UPSTASH_URL && UPSTASH_TOKEN);

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  resetAt: number;
};

/**
 * 同步 API (in-memory fallback,主要給已存在的呼叫者用)。
 * Upstash 模式下會做 fire-and-forget,先回 in-memory 結果 + 背景同步到 Redis。
 *
 * 想要嚴格跨 instance 的呼叫者用 rateLimitAsync。
 */
export function rateLimit(
  key: string,
  options: { max: number; windowMs: number }
): RateLimitResult {
  const now = Date.now();
  const entry = memoryStore.get(key);
  if (!entry || now - entry.firstAt > options.windowMs) {
    memoryStore.set(key, { count: 1, firstAt: now });
    if (HAS_UPSTASH) void upstashIncr(key, options.windowMs).catch(() => {});
    return { ok: true, remaining: options.max - 1, resetAt: now + options.windowMs };
  }
  entry.count += 1;
  if (HAS_UPSTASH) void upstashIncr(key, options.windowMs).catch(() => {});
  if (entry.count > options.max) {
    return { ok: false, remaining: 0, resetAt: entry.firstAt + options.windowMs };
  }
  return {
    ok: true,
    remaining: options.max - entry.count,
    resetAt: entry.firstAt + options.windowMs,
  };
}

/**
 * 嚴格跨 instance 的速率限制(配對碼暴破 / 重要 API 用這個)。
 * 沒設 Upstash 時自動 fallback 到同步版。
 */
export async function rateLimitAsync(
  key: string,
  options: { max: number; windowMs: number }
): Promise<RateLimitResult> {
  if (!HAS_UPSTASH) {
    return rateLimit(key, options);
  }
  try {
    const count = await upstashIncr(key, options.windowMs);
    const resetAt = Date.now() + options.windowMs;
    if (count > options.max) {
      return { ok: false, remaining: 0, resetAt };
    }
    return { ok: true, remaining: options.max - count, resetAt };
  } catch {
    // Upstash 掛了 -> fallback in-memory
    return rateLimit(key, options);
  }
}

// Upstash REST API: INCR + EXPIRE 一次完成
// 用 pipeline,一次 round-trip
async function upstashIncr(key: string, windowMs: number): Promise<number> {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) throw new Error("UPSTASH_NOT_CONFIGURED");
  const ttlSec = Math.ceil(windowMs / 1000);
  const safeKey = `rl:${key}`;
  // pipeline: INCR + EXPIRE NX (只在無 TTL 時設)
  const res = await fetch(`${UPSTASH_URL}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${UPSTASH_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([
      ["INCR", safeKey],
      ["EXPIRE", safeKey, String(ttlSec), "NX"],
    ]),
    // 避免 Upstash 慢死整個 request
    signal: AbortSignal.timeout(2000),
  });
  if (!res.ok) throw new Error(`UPSTASH_${res.status}`);
  const data = (await res.json()) as Array<{ result: number }>;
  const count = data?.[0]?.result;
  if (typeof count !== "number") throw new Error("UPSTASH_BAD_RESPONSE");
  return count;
}

// In-memory cleanup
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [k, v] of memoryStore.entries()) {
      if (now - v.firstAt > 60 * 60 * 1000) memoryStore.delete(k);
    }
  }, 5 * 60 * 1000);
}
