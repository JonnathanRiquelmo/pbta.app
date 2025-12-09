import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/pbta.app/',
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
        start_url: '/pbta.app/',
        scope: '/pbta.app/',
        display: 'standalone',
        background_color: '#0b0b0f',
        theme_color: '#6b46ff',
        icons: [
          {
            src: 'favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml'
          }
        ]
      }
    })
  ]
})
