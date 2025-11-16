import { Outlet } from 'react-router-dom'
import BottomTabs from './BottomTabs'
import Header from './Header'

export default function AppLayout() {
  return (
    <div style={{ display: 'grid', gridTemplateRows: 'auto 1fr auto', minHeight: '100dvh' }}>
      <Header />
      <main style={{ padding: 'var(--space-4)', paddingBottom: 'calc(var(--space-10) + env(safe-area-inset-bottom))' }}>
        <Outlet />
      </main>
      <BottomTabs />
    </div>
  )
}