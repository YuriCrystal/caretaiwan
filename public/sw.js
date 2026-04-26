// CareTaiwan Service Worker — v4 (network-first navigation 避免新部署後 HTML/chunk 失配)
const CACHE_NAME = "caretaiwan-v9";

const STATIC_URLS = [
  "/",
  "/help",
  "/record",
  "/card",
  "/card/edit",
  "/about",
  "/backup",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
];

const CATEGORY_URLS = [
  "/category/emergency",
  "/category/vitals",
  "/category/medication",
  "/category/bedridden",
  "/category/dementia",
  "/category/feeding",
];

const SCENARIO_IDS = [
  "01","02","03","04","05","06","07","08","09","10",
  "11","12","13","14","15","16","17","18",
  "19","20","21","22","25",
  "26","27","29","30","31",
  "34","35","38","39","40","41",
  "42","44","45","46","50",
];
const SCENARIO_URLS = SCENARIO_IDS.map((id) => `/scenario/${id}`);

const PRECACHE_URLS = [...STATIC_URLS, ...CATEGORY_URLS, ...SCENARIO_URLS];

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

  // Never cache API routes (auth, cloud sync)
  if (url.pathname.startsWith("/api/")) {
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

  // Navigation requests: network-first to ensure fresh HTML matches deployed chunk names.
  // Cache fallback only when offline. This avoids "page errors after redeploy" caused by
  // stale cached HTML referencing chunks that have been replaced.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() =>
          caches.match(req).then((cached) => cached || caches.match("/"))
        )
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
