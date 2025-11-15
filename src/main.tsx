import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import '../firebase/config'
import '../firebase/firestore'
import { initAnalytics } from './utils/analytics'
import { initPerformance } from './utils/performance'
import { AuthProvider } from './contexts/AuthContext'
import { ModeProvider } from './contexts/ModeContext'
import { ToastProvider } from './components/common/toast/ToastProvider'
import { useNetworkStatus } from './hooks/useNetworkStatus'
import './styles/tokens.css'
import './styles/base.css'

function ServiceWorkerRegistrar() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const swUrl = `${import.meta.env.BASE_URL}sw.js`
      navigator.serviceWorker.register(swUrl).catch(() => {})
    }
  }, [])
  return null
}

function NetworkRedirector() {
  const { online } = useNetworkStatus()
  useEffect(() => {
    if (!online && !location.hash.includes('/offline')) {
      location.hash = '#/offline'
    }
  }, [online])
  return null
}

function NetworkBanner() {
  const { online } = useNetworkStatus()
  if (online) return null
  return (
    <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: 8, background: '#222', color: '#fff', textAlign: 'center', fontSize: 12 }}>
      Você está offline. Tentando reconectar…
    </div>
  )
}

const root = document.getElementById('root')!
initAnalytics({ enabled: import.meta.env.VITE_ENABLE_ANALYTICS !== 'false' })
initPerformance({ enabled: import.meta.env.VITE_ENABLE_PERFORMANCE !== 'false' })
createRoot(root).render(
  <StrictMode>
    <AuthProvider>
      <ModeProvider>
        <ToastProvider>
          <ServiceWorkerRegistrar />
          <NetworkRedirector />
          <NetworkBanner />
          <RouterProvider router={router} />
        </ToastProvider>
      </ModeProvider>
    </AuthProvider>
  </StrictMode>
)