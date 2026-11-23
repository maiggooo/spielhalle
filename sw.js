// Offline-Modus: Mit Netz wird immer frisch geladen (und gespeichert), ohne Netz kommt die gespeicherte Version.
// Wizard braucht trotzdem Netz (Firebase), Firebase-Anfragen werden hier nicht angefasst.
const CACHE = "spielhalle";
const CORE = [
  "./", "index.html", "site.css", "site.js", "favicon.png", "manifest.json",
  "derduemmstefliegt.html", "fragen.json", "zuendschnur.html", "stirnraten.html",
  "spyfall.html", "werwolf.html", "wizard.html", "multiplayer.js"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));

self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  const ownOrFont = url.origin === location.origin || /^fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  if (e.request.method !== "GET" || !ownOrFont) return;
  e.respondWith(
    fetch(e.request).then(res => {
      if (res.ok || res.type === "opaque") {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
      }
      return res;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
