import { defineConfig } from 'vitest/config'

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
      '@npc': '/src/npc'
    }
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [],
    exclude: ['tests/e2e/**', 'node_modules/**', 'functions/node_modules/**']
  }
})