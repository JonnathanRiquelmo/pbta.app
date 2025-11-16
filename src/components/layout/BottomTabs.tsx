import { useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Tabs from '../common/tabs/Tabs'
import { useMode } from '../../contexts/ModeContext'

type NavItem = { id: string; label: string; path: string }

function useItems(isMaster: boolean): NavItem[] {
  if (isMaster) {
    return [
      { id: 'master-home', label: '🎛️ Mestre', path: '/master' },
      { id: 'master-campaigns', label: '🗺️ Campanhas', path: '/master/campaigns' },
      { id: 'master-pdms', label: '👤 PDMs', path: '/master/pdms' },
      { id: 'master-rolls', label: '🎲 Rolagens', path: '/master/rolls' }
    ]
  }
  return [
    { id: 'dashboard', label: '🏠 Dashboard', path: '/dashboard' },
    { id: 'sheets', label: '🎭 Fichas', path: '/sheets' },
    { id: 'campaigns', label: '🗺️ Campanhas', path: '/campaigns' },
    { id: 'roller', label: '🎲 Rolagens', path: '/roller' },
    { id: 'notes', label: '📝 Notas', path: '/notes' }
  ]
}

function activeFromPath(pathname: string, isMaster: boolean): string {
  if (isMaster) {
    if (pathname.startsWith('/master/rolls')) return 'master-rolls'
    if (pathname.startsWith('/master/pdms')) return 'master-pdms'
    if (pathname.startsWith('/master/campaigns')) return 'master-campaigns'
    return 'master-home'
  }
  if (pathname.startsWith('/notes')) return 'notes'
  if (pathname.startsWith('/roller')) return 'roller'
  if (pathname.startsWith('/campaigns') && !pathname.startsWith('/master')) return 'campaigns'
  if (pathname.startsWith('/sheets')) return 'sheets'
  return 'dashboard'
}

export default function BottomTabs() {
  const { isMaster } = useMode()
  const master = isMaster()
  const items = useItems(master)
  const location = useLocation()
  const navigate = useNavigate()
  const value = useMemo(() => activeFromPath(location.pathname, master), [location.pathname, master])

  return (
    <div style={{ position: 'sticky', bottom: 0, zIndex: 10, background: 'var(--color-neutral-0)', borderTop: '1px solid var(--color-neutral-200)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <Tabs
        items={items.map(i => ({ id: i.id, label: i.label, content: null }))}
        value={value}
        onChange={(id) => {
          const target = items.find(i => i.id === id)
          if (target) navigate(target.path)
        }}
      />
    </div>
  )
}