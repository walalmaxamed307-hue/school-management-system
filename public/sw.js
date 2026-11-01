/*
 * IskuulCaawiye deliberately keeps this worker network-first.
 * Only public PWA metadata and icons are cached; API calls, login responses,
 * tokens, and all school data are never stored in Cache Storage.
 */
const workerBuild = new URL(self.location.href).searchParams.get('build') || 'v1'
const STATIC_CACHE = `iskuulcaawiye-pwa-static-${workerBuild}`
const STATIC_ASSETS = [
  '/manifest.webmanifest',
  '/pwa-192.png',
  '/pwa-512.png',
  '/pwa-maskable-512.png',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .catch(() => undefined),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys
        .filter((key) => key.startsWith('iskuulcaawiye-pwa-') && key !== STATIC_CACHE)
        .map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting()
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  const url = new URL(request.url)
  const isPublicPwaAsset = request.method === 'GET'
    && url.origin === self.location.origin
    && STATIC_ASSETS.includes(url.pathname)

  if (!isPublicPwaAsset) return

  // The cache is only an offline fallback for public manifest/icon files.
  // HTML, JavaScript, pages, API traffic, and authenticated school records
  // are always network-only and therefore cannot become stale shared data.
  event.respondWith(fetch(request).catch(() => caches.match(request)))
})
