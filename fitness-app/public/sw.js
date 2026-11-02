// Service worker de MVP Team: abre rápido y funciona sin cobertura.
//
// Reglas (conservadoras, para no quedarse nunca con una versión vieja):
//   · Página (HTML)         → red primero; si no hay red o tarda > 3 s, la guardada.
//   · /assets/* (código)    → caché primero. Cada versión publicada tiene nombres
//                             nuevos (hash), así que nunca se mezclan versiones.
//   · Fuentes e iconos CDN  → la guardada al instante y se actualiza por detrás.
//   · Supabase (datos)      → NUNCA se cachea: siempre en directo.
//
// Para forzar que todos los móviles descarten la caché: sube VERSION.

const VERSION = "v1";
const PAGES   = `mvp-pages-${VERSION}`;
const ASSETS  = `mvp-assets-${VERSION}`;
const EXTERN  = `mvp-extern-${VERSION}`;
const KEEP = [PAGES, ASSETS, EXTERN];

const NETWORK_TIMEOUT_MS = 3000;
const EXTERNAL_HOSTS = ["fonts.googleapis.com", "fonts.gstatic.com", "cdn.jsdelivr.net"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(PAGES).then((c) => c.add("/")).catch(() => {}).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("mvp-") && !KEEP.includes(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // Datos y fotos de Supabase: siempre en directo
  if (url.hostname.endsWith("supabase.co") || url.hostname.endsWith("supabase.in")) return;

  // Navegación: red primero con tiempo límite, caché como respaldo
  if (req.mode === "navigate") {
    event.respondWith(networkFirstPage(req));
    return;
  }

  if (url.origin === self.location.origin) {
    if (url.pathname.startsWith("/assets/")) {
      event.respondWith(cacheFirst(req, ASSETS));
    } else if (url.pathname !== "/sw.js") {
      event.respondWith(staleWhileRevalidate(req, ASSETS));
    }
    return;
  }

  if (EXTERNAL_HOSTS.includes(url.hostname)) {
    event.respondWith(staleWhileRevalidate(req, EXTERN));
  }
  // Resto (YouTube, etc.): sin tocar
});

async function networkFirstPage(req) {
  const cache = await caches.open(PAGES);
  // La descarga sigue aunque se agote el tiempo: así la próxima apertura ya tiene la versión nueva
  const fromNetwork = fetch(req).then((res) => {
    if (res && res.ok) cache.put("/", res.clone());
    return res;
  });
  try {
    return await withTimeout(fromNetwork, NETWORK_TIMEOUT_MS);
  } catch {
    const cached = await cache.match("/");
    return cached || fromNetwork; // sin caché todavía: esperar a la red
  }
}

async function cacheFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req);
  if (cached) return cached;
  const res = await fetch(req);
  if (res && res.ok) cache.put(req, res.clone());
  return res;
}

async function staleWhileRevalidate(req, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req);
  const network = fetch(req)
    .then((res) => {
      if (res && (res.ok || res.type === "opaque")) cache.put(req, res.clone());
      return res;
    })
    .catch(() => cached);
  return cached || network;
}

function withTimeout(promise, ms) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("timeout")), ms);
    promise.then((v) => { clearTimeout(t); resolve(v); }, (e) => { clearTimeout(t); reject(e); });
  });
}
