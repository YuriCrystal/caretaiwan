// CareTaiwan Service Worker — v2 (含 _next/static 快取，支援完整離線互動)
const CACHE_NAME = "caretaiwan-v2";
const PRECACHE_URLS = [
  "/",
  "/help",
  "/record",
  "/card",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.allSettled(PRECACHE_URLS.map((url) => cache.add(url)))
    )
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(
          names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Only handle GET on same origin
  if (req.method !== "GET" || url.origin !== self.location.origin) return;

  // Skip dev HMR endpoints (unrelated to production)
  if (
    url.pathname.startsWith("/__nextjs") ||
    url.pathname.includes("hot-update") ||
    url.pathname.includes("hmr")
  ) {
    return;
  }

  // Static immutable assets (Next.js build chunks, CSS, fonts, images, manifest)
  // Cache-first because filenames are content-hashed
  const isStatic =
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|webp|woff2?|ttf|ico)$/i);

  if (isStatic) {
    event.respondWith(
      caches.match(req).then(
        (cached) =>
          cached ||
          fetch(req).then((res) => {
            if (res.ok) {
              const copy = res.clone();
              caches.open(CACHE_NAME).then((c) => c.put(req, copy));
            }
            return res;
          })
      )
    );
    return;
  }

  // Navigation requests: stale-while-revalidate (instant from cache, refresh in background)
  if (req.mode === "navigate") {
    event.respondWith(
      caches.match(req).then((cached) => {
        const fetchPromise = fetch(req)
          .then((res) => {
            if (res.ok) {
              const copy = res.clone();
              caches.open(CACHE_NAME).then((c) => c.put(req, copy));
            }
            return res;
          })
          .catch(() => cached || caches.match("/"));
        return cached || fetchPromise;
      })
    );
    return;
  }

  // Other GETs: network-first with cache fallback
  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok && url.origin === self.location.origin) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match(req))
  );
});
