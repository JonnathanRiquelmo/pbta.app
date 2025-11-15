import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(() => ({
  plugins: [react()],
  base: '/pbta.app/',
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom']
  },
  test: {
    environment: 'jsdom',
    setupFiles: 'src/test/setup.ts',
    globals: true
  }
}))