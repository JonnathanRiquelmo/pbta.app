import { Outlet, Navigate } from 'react-router-dom'
import { useMode } from '../../contexts/ModeContext'

export default function ModeGuard() {
  const { isMaster } = useMode()
  if (!isMaster()) return <Navigate to="/dashboard" replace />
  return <Outlet />
}