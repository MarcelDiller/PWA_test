const CACHE_NAME = "dennert-icon-v1";

// Alle Dateien die offline verfügbar sein sollen
const FILES_TO_CACHE = [
  "/",
  "index.html",
  "main.html",
  "css/CSS-test.css",
  "docs/2026-01-15_ Abnahme Fenster.pdf",
  "icons/icon-192.png",
  "icons/icon-512.png"
];

// Installation: Dateien in Cache laden
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Aktivierung: alten Cache löschen
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch: Cache First Strategie
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request).catch(() => {
        // Offline-Fallback für HTML-Seiten
        if (event.request.destination === "document") {
          return caches.match("index.html");
        }
      });
    })
  );

});
