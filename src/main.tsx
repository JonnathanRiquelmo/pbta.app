import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import '../firebase/config'
import '../firebase/firestore'
import { AuthProvider } from './contexts/AuthContext'
import { ModeProvider } from './contexts/ModeContext'
import { ToastProvider } from './components/common/toast/ToastProvider'
import './styles/tokens.css'
import './styles/base.css'

const root = document.getElementById('root')!
createRoot(root).render(
  <StrictMode>
    <AuthProvider>
      <ModeProvider>
        <ToastProvider>
          <RouterProvider router={router} />
        </ToastProvider>
      </ModeProvider>
    </AuthProvider>
  </StrictMode>
)