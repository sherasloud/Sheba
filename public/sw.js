// This is the service worker file (sw.js)
// It's responsible for caching assets and handling network requests for offline support.

const CACHE_NAME = "sheba-app-cache-v4"
const urlsToCache = [
  "/",
  "/send-money",
  "/recharge",
  "/cashout",
  "/images/app-logo.png",
  "/images/seba-logo-splash.png",
  "/images/send-money-icon.png",
  "/images/recharge-icon.png",
  "/images/cashout-icon.png",
  "/images/sheba-cloud-logo-192.png",
  "/images/sheba-cloud-logo-512.png",
  "/manifest.json",
]

self.addEventListener("install", (event) => {
  console.log("[SW] Installing Sheba PWA service worker")
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opened Sheba cache")
      return cache.addAll(urlsToCache)
    }),
  )
  self.skipWaiting()
})

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting()
  }
  if (event.data && event.data.type === "GET_VERSION") {
    event.ports[0].postMessage({ version: CACHE_NAME })
  }
})

self.addEventListener("activate", (event) => {
  console.log("[SW] Service worker activated")
  const cacheWhitelist = [CACHE_NAME]
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName)
          }
        }),
      )
    }),
  )

  // Claim all clients immediately
  self.clients.claim()
})

self.addEventListener("fetch", (event) => {
  // Bypass service worker for .wasm files to prevent compilation errors
  if (event.request.url.endsWith(".wasm")) {
    event.respondWith(fetch(event.request))
    return
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Cache hit - return response
      if (response) {
        return response
      }
      return fetch(event.request).then((response) => {
        // Check if we received a valid response
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response
        }

        // IMPORTANT: Clone the response. A response is a stream
        // and can only be consumed once. We must clone it so that
        // we can consume one in the cache and one in the browser.
        const responseToCache = response.clone()

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache)
        })

        return response
      })
    }),
  )
})
