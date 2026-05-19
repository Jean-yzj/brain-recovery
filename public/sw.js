const CACHE = "brain-recovery-v1";
const CORE = ["/", "/manifest.json", "/icon.svg"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).catch(() => null));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET") return;
  if (url.pathname.startsWith("/api/")) return;
  if (url.pathname.startsWith("/_next/data")) return;

  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const copy = res.clone();
        if (res.ok && res.type === "basic") {
          caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => null);
        }
        return res;
      })
      .catch(() => caches.match(e.request).then((r) => r || caches.match("/")))
  );
});
