const STATIC_CACHE = "alupbesk-static-v5";
const DYNAMIC_CACHE = "alupbesk-dynamic-v4";

const PRIVATE_PATH_PREFIXES = [
  "/manager",
  "/owner",
  "/admin",
  "/marketing",
  "/gudang",
  "/keuangan",
  "/pm",
  "/produksi",
  "/field",
  "/api/manager",
  "/api/owner",
  "/api/admin",
  "/api/marketing",
  "/api/gudang",
  "/api/keuangan",
  "/api/pm",
  "/api/produksi",
  "/api/field",
  "/api/auth",
  "/api/upload",
];

function isPrivatePath(pathname) {
  if (pathname === "/admin") return false;
  return PRIVATE_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function isPublicApiPath(pathname) {
  return (
    pathname === "/api/catalog/products" ||
    pathname.startsWith("/api/catalog/products/") ||
    pathname === "/api/portfolio" ||
    pathname.startsWith("/api/content/faq") ||
    pathname.startsWith("/api/content/partners") ||
    pathname.startsWith("/api/content/portfolio") ||
    pathname.startsWith("/api/content/services") ||
    pathname.startsWith("/api/content/site/")
  );
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.add("/offline.html"))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) =>
            key.startsWith("alupbesk-") && key !== STATIC_CACHE && key !== DYNAMIC_CACHE,
          )
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== "GET") return;
  if (url.origin !== self.location.origin) return;

  // Static hashed assets — cache-first (immutable by design)
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            const clone = response.clone();
            caches.open(STATIC_CACHE).then((c) => c.put(request, clone));
            return response;
          })
      )
    );
    return;
  }

  // Static files (icons, manifest, images) — cache-first
  if (
    url.pathname.startsWith("/icon-") ||
    url.pathname.startsWith("/apple-") ||
    url.pathname === "/manifest.json" ||
    (!url.search && /^\/(?:images|logos|fonts)\/[^/]+\.(?:svg|png|jpe?g|webp|woff2?)$/i.test(url.pathname)) ||
    (!url.search && /^\/[^/]+\.(?:svg|png|ico)$/i.test(url.pathname))
  ) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            const clone = response.clone();
            caches.open(STATIC_CACHE).then((c) => c.put(request, clone));
            return response;
          })
      )
    );
    return;
  }

  // API — network-first with cache fallback
  if (url.pathname.startsWith("/api/")) {
    if (!isPublicApiPath(url.pathname)) {
      event.respondWith(fetch(request));
      return;
    }

    event.respondWith(
      fetch(request)
        .then((response) => {
          const cacheControl = response.headers.get("cache-control") ?? "";
          if (response.ok && !/private|no-store/i.test(cacheControl)) {
            const clone = response.clone();
            caches.open(DYNAMIC_CACHE).then((c) => c.put(request, clone));
          }
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // HTML navigation — network-first, offline fallback
  if (request.headers.get("accept")?.includes("text/html")) {
    if (isPrivatePath(url.pathname)) {
      event.respondWith(
        fetch(request).catch(() => caches.match("/offline.html")),
      );
      return;
    }

    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(DYNAMIC_CACHE).then((c) => c.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request).then((r) => r || fetch("/offline.html")))
    );
    return;
  }

  // Everything else — stale-while-revalidate
  // Unknown requests may contain user-specific data or signed file URLs.
  // Keep them network-only so responses cannot persist across accounts.
  event.respondWith(fetch(request));
});

self.addEventListener("push", (event) => {
  const data = event.data?.json() || {
    title: "alupbesk",
    body: "Ada notifikasi baru untuk Anda",
  };

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icon-192x192.png",
      badge: "/icon-192x192.png",
      vibrate: [200, 100, 200],
      data: data.url || "/",
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((windowClients) => {
      const url = event.notification.data || "/";
      for (const client of windowClients) {
        if (client.url.includes(url) && "focus" in client) {
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});
