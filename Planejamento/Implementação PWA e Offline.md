# Implementação PWA e Offline — pbta.app

## 10. Implementação PWA e Offline

### 10.1 Service Worker Configuration

```typescript
// sw.ts
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute, setCatchHandler } from 'workbox-routing';
import { NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

declare let self: ServiceWorkerGlobalScope;

precacheAndRoute(self.__WB_MANIFEST);

registerRoute(
  ({ request }) => request.destination === 'document',
  new NetworkFirst({
    cacheName: 'pages',
    networkTimeoutSeconds: 3,
  })
);

registerRoute(
  ({ request }) => request.destination === 'style',
  new StaleWhileRevalidate({ cacheName: 'styles' })
);

registerRoute(
  ({ request }) => request.destination === 'script',
  new StaleWhileRevalidate({ cacheName: 'scripts' })
);

registerRoute(
  ({ request }) => request.destination === 'image',
  new StaleWhileRevalidate({
    cacheName: 'images',
    plugins: [
      new ExpirationPlugin({ maxEntries: 60, maxAgeSeconds: 30 * 24 * 60 * 60 }),
    ],
  })
);

registerRoute(
  ({ request }) => request.destination === 'font',
  new StaleWhileRevalidate({
    cacheName: 'fonts',
    plugins: [
      new ExpirationPlugin({ maxEntries: 30, maxAgeSeconds: 365 * 24 * 60 * 60 }),
    ],
  })
);

setCatchHandler(async ({ event }) => {
  if (event.request.destination === 'document') {
    return (await caches.match('/offline')) || Response.error();
  }
  return Response.error();
});
```

### 10.2 Manifest.json

```json
{
  "name": "pbta.app",
  "short_name": "PBTA",
  "description": "Plataforma universal PBTA com modos Jogador e Mestre",
  "theme_color": "#0F172A",
  "background_color": "#FFFFFF",
  "display": "standalone",
  "scope": "/",
  "start_url": "/",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

### 10.3 Diretrizes de Offline-aware

- Cache de assets com Service Worker e fallback de páginas para `/offline`.
- Bloqueio de ações que dependem do Firestore quando offline; sincronização automática ao reconectar.
- Persistência offline do Firestore habilitada no cliente.
- UI mobile-first e touch-friendly (botões ≥42px, gestos de swipe).