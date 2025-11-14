import { Outlet, Navigate } from 'react-router-dom'
import { auth } from '../../../firebase/config'

export default function ModeGuard() {
  const email = auth.currentUser?.email || ''
  const isMaster = email === 'jonnathan.riquelmo@gmail.com'
  if (!isMaster) return <Navigate to="/dashboard" replace />
  return <Outlet />
}