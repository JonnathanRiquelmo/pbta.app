import { Outlet, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export default function AuthGuard() {
  const { loading: ready, user } = useAuth()
  const location = useLocation()
  if (!ready) return <div style={{ padding: 24 }}>Carregando...</div>
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return <Outlet />
}