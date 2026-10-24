const CACHE_NAME = "najahna-shell-v37";
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./assets/icons/najahna.svg",
  "./assets/css/main.css",
  "./assets/js/app.js",
  "./src/data/resources.js",
  "./src/utils/pdf-resources.js",
  "./src/data/official-sources.js",
  "./src/data/school-calendar.js",
  "./src/data/curriculum.js",
  "./src/data/resource-filters.js",
  "./src/data/quiz.js",
  "./src/calculators/average.js",
  "./src/utils/collections.js",
  "./src/utils/notes.js",
  "./src/utils/study-plan.js",
  "./src/utils/storage.js",
  "./src/utils/history.js",
  "./src/utils/quiz-history.js",
  "./src/utils/backup.js",
  "./src/utils/dates.js",
  "./src/i18n/ar.js",
  "./src/i18n/fr.js",
  "./src/i18n/en.js"
];

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(APP_SHELL);
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith("najahna-shell-") && key !== CACHE_NAME).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response.ok) {
          const cache = await caches.open(CACHE_NAME);
          await cache.put("./index.html", response.clone());
        }
        return response;
      } catch {
        return (await caches.match(request)) || (await caches.match("./index.html")) || Response.error();
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cached = await caches.match(request);
    if (cached) return cached;
    try {
      const response = await fetch(request);
      if (response.ok && response.type === "basic") {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(request, response.clone());
      }
      return response;
    } catch {
      return Response.error();
    }
  })());
});
