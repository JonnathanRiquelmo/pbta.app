import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  resolve: {
    alias: {
      '@auth': '/src/auth',
      '@shared': '/src/shared',
      '@routes': '/src/routes',
      '@campaigns': '/src/campaigns',
      '@characters': '/src/characters',
      '@moves': '/src/moves',
      '@sessions': '/src/sessions',
      '@rolls': '/src/rolls',
      '@npc': '/src/npc',
      '@fb': '/src/firebase'
    }
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'PBTA App',
        short_name: 'PBTA',
        start_url: '/',
        display: 'standalone',
        background_color: '#0b0b0f',
        theme_color: '#6b46ff',
        icons: [
          {
            src: 'favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'html-cache',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 },
              networkTimeoutSeconds: 3
            }
          },
          {
            urlPattern: ({ url }) => /\.(?:js|css|svg|png|jpg|jpeg|webp|woff2)$/.test(url.pathname),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'assets-cache',
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 }
            }
          },
          {
            urlPattern: ({ url }) => url.origin === 'https://firestore.googleapis.com',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-firestore',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 },
              networkTimeoutSeconds: 3
            }
          }
        ]
      }
    })
  ]
})