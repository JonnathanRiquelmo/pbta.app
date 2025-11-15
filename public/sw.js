/* eslint-disable no-undef */
importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js')

workbox.core.skipWaiting()
workbox.core.clientsClaim()
workbox.precaching.cleanupOutdatedCaches()

workbox.routing.registerRoute(
  ({ request }) => ['style', 'script', 'worker', 'font'].includes(request.destination),
  new workbox.strategies.StaleWhileRevalidate({ cacheName: 'static-assets' })
)

workbox.routing.registerRoute(
  ({ request }) => request.destination === 'image',
  new workbox.strategies.StaleWhileRevalidate({ cacheName: 'images' })
)

workbox.routing.registerRoute(
  ({ request }) => request.mode === 'navigate',
  new workbox.strategies.NetworkFirst({ cacheName: 'pages', networkTimeoutSeconds: 3 })
)

workbox.routing.setCatchHandler(async ({ event }) => {
  if (event.request.mode === 'navigate') {
    const scopeUrl = self.registration?.scope || '/'
    return (await caches.match(scopeUrl)) || (await caches.match('/index.html')) || Response.error()
  }
  return Response.error()
})