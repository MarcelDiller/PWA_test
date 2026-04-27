const CACHE_NAME = "dennert-icon-v2"; // ← Bei jedem Deploy erhöhen!

const FILES_TO_CACHE = [
  "index.html",
  "Main.html",
  "sharepoint.js",
  "css/CSS-index.css",
  "css/CSS-test.css",
  "docs/2026-01-15_ Abnahme Fenster.pdf",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "Bilder/dennert-logo.png"
];

// Installation
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      const results = FILES_TO_CACHE.map(url =>
        fetch(url)
          .then(res => {
            if (!res.ok) {
              console.error(`❌ FEHLER ${res.status}: ${url}`);
            } else {
              console.log(`✅ OK: ${url}`);
            }
            return cache.add(url).catch(() => {
              console.error(`❌ Cache fehlgeschlagen: ${url}`);
            });
          })
          .catch(err => console.error(`❌ Nicht erreichbar: ${url}`, err))
      );
      return Promise.allSettled(results);
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

// Fetch: Hybrid-Strategie
self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);
  const isCSSorJS = url.pathname.match(/\.(css|js)$/);

  if (isCSSorJS) {
    // CSS & JS: Netzwerk zuerst → immer aktuelle Styles
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
  } else {
    // HTML, Bilder, PDFs: Cache First → schnell & offline-fähig
    event.respondWith(
      caches.match(event.request).then(cached => {
        return cached || fetch(event.request).catch(() => {
          if (event.request.destination === "document") {
            return caches.match("index.html");
          }
        });
      })
    );
  }
});