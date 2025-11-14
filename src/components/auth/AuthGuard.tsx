import { useEffect, useState } from 'react'
import { Outlet, Navigate, useLocation } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../../../firebase/config'

export default function AuthGuard() {
  const [ready, setReady] = useState(false)
  const [user, setUser] = useState<any>(null)
  const location = useLocation()
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      setUser(u)
      setReady(true)
    })
    return () => unsub()
  }, [])
  if (!ready) return <div style={{ padding: 24 }}>Carregando...</div>
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return <Outlet />
}