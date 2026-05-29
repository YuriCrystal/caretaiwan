// Next.js instrumentation - 啟動時載入對應 runtime 的 Sentry config
// 沒設 SENTRY_DSN 時這些 config 內部會跳過 init,不會炸。
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

// onRequestError: server-side error 自動 capture
export { captureRequestError as onRequestError } from "@sentry/nextjs";
