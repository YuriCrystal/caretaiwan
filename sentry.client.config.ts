// Sentry 瀏覽器端錯誤追蹤
// 沒設 NEXT_PUBLIC_SENTRY_DSN 就完全不啟動,不影響運作。
import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    // 採樣率: closed beta 全採樣,流量大後降到 0.1
    tracesSampleRate: 1.0,
    // PII 過濾: 不送 user IP / email / cookie
    sendDefaultPii: false,
    // 開發環境不送 (避免 noise)
    enabled: process.env.NODE_ENV === "production",
    // 過濾常見不需要追蹤的錯誤
    beforeSend(event, hint) {
      // 過濾 LINE in-app webview 偶發的 ResizeObserver loop
      const msg = hint?.originalException as Error | undefined;
      if (msg?.message?.includes("ResizeObserver loop")) return null;
      if (msg?.message?.includes("Non-Error promise rejection captured")) return null;
      return event;
    },
  });
}
