import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import '../firebase/config'
import '../firebase/firestore'
import { AuthProvider } from './contexts/AuthContext'
import { ModeProvider } from './contexts/ModeContext'

const root = document.getElementById('root')!
createRoot(root).render(
  <StrictMode>
    <AuthProvider>
      <ModeProvider>
        <RouterProvider router={router} />
      </ModeProvider>
    </AuthProvider>
  </StrictMode>
)