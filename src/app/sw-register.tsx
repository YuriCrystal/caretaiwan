"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    const isLocalhost =
      location.hostname === "localhost" || location.hostname === "127.0.0.1";
    const isProd = process.env.NODE_ENV === "production";

    // In dev mode (or anywhere not production): proactively unregister stale SWs
    // and clear caches so dev iterations are not blocked by stale chunks.
    if (!isProd) {
      navigator.serviceWorker.getRegistrations().then((regs) => {
        regs.forEach((r) => r.unregister());
      });
      if ("caches" in window) {
        caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)));
      }
      return;
    }

    // Production only: register on https or localhost
    const ok = location.protocol === "https:" || isLocalhost;
    if (!ok) return;
    navigator.serviceWorker
      .register("/sw.js")
      .catch((err) => console.warn("SW register failed", err));
  }, []);
  return null;
}
