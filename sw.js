/* Service worker de Claude Code — Certification & Practice.
   Incrémenter CACHE à chaque ajout ou suppression de fichier dans ASSETS. */
const CACHE = "claude-code-practice-v1";
const FONT_CACHE = "claude-code-practice-fonts-v1";

const ASSETS = [
  "./",
  "index.html",
  "style.css",
  "app.js",
  "manifest.webmanifest",
  "data/domains.js",
  "data/programme.js",
  "data/courses.js",
  "data/questions.js",
  "data/practice.js",
  "icons/icon.svg",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/maskable-512.png",
  "icons/apple-touch-icon.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE && k !== FONT_CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // Polices Google : cache d’abord, dans un cache séparé.
  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") {
    event.respondWith(
      caches.open(FONT_CACHE).then((cache) =>
        cache.match(req).then((hit) => hit || fetch(req).then((res) => {
          if (res.ok || res.type === "opaque") cache.put(req, res.clone());
          return res;
        }))
      )
    );
    return;
  }

  if (url.origin !== self.location.origin) return;

  // Fichiers de l’application : réseau d’abord, cache en secours.
  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(req, copy));
        }
        return res;
      })
      .catch(() =>
        caches.match(req, { ignoreSearch: true }).then((hit) => {
          if (hit) return hit;
          if (req.mode === "navigate") return caches.match("index.html");
          return Response.error();
        })
      )
  );
});
