/* ============================================================
   PolyVault service worker — offline-first app shell.
   Data lives in IndexedDB, so caching the shell + assets is
   enough for the whole app to work with no connection.
   ============================================================ */
const VERSION = "pv-v6";
const SHELL_CACHE = `shell-${VERSION}`;
const ASSET_CACHE = `assets-${VERSION}`;
const SHELL_ROUTES = ["/", "/study", "/decks", "/search", "/notebook", "/stats", "/settings", "/generate", "/import", "/account", "/account/edit", "/account/preview", "/account/verify", "/connect"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_ROUTES)).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => !k.endsWith(VERSION)).map((k) => caches.delete(k))),
    ).then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return; // AI calls: network only, client has offline fallback

  // navigations: network first, cached shell as offline fallback
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(SHELL_CACHE).then((c) => c.put(request, copy));
          return res;
        })
        .catch(async () => {
          const cached = await caches.match(request, { ignoreSearch: true });
          return cached ?? caches.match("/");
        }),
    );
    return;
  }

  // Only content-hashed build files and icons are cached (they never change).
  // Everything else — including Next.js page data (RSC) fetched during
  // navigation — goes straight to the network, so a new deploy never mixes
  // with pieces of the previous one.
  const immutable = url.pathname.startsWith("/_next/static/") || /^\/icon[-\w]*\.png$/.test(url.pathname);
  if (!immutable) return;
  event.respondWith(
    caches.match(request).then((cached) =>
      cached ?? fetch(request).then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(ASSET_CACHE).then((c) => c.put(request, copy));
        }
        return res;
      }),
    ),
  );
});
