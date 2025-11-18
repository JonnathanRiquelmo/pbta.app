import { Outlet } from 'react-router-dom'
import { AppLayout } from './shared/layout/AppLayout'

export default function App() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  )
}