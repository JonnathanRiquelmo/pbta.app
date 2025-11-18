import { Navigate, Outlet } from 'react-router-dom'
import { useAppStore } from '@shared/store/appStore'
import type { Role } from './types'

export function RequireAuth() {
  const user = useAppStore(s => s.user)
  if (!user) return <Navigate to="/login" replace />
  return <Outlet />
}

export function RequireRole({ role, children }: { role: Role; children: React.ReactNode }) {
  const user = useAppStore(s => s.user)
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== role) return <Navigate to={user.role === 'master' ? '/dashboard/master' : '/dashboard/player'} replace />
  return <>{children}</>
}