import { PropsWithChildren, useMemo } from 'react'
import { useLocation, useNavigate, Outlet } from 'react-router-dom'
import { Button } from '../common'
import { useMode } from '../../contexts/ModeContext'
import BottomTabs from './BottomTabs'

type TitleMap = { match: (p: string) => boolean; title: string }

function usePageTitle(pathname: string, isMaster: boolean): string {
  const maps: TitleMap[] = [
    { match: p => p === '/dashboard', title: 'Dashboard' },
    { match: p => p.startsWith('/sheets'), title: 'Fichas' },
    { match: p => p.startsWith('/campaigns') && !p.startsWith('/master'), title: 'Campanhas' },
    { match: p => p.startsWith('/roller'), title: 'Rolagens' },
    { match: p => p.startsWith('/profile'), title: 'Perfil' },
    { match: p => p.startsWith('/notes'), title: 'Notas' },
    { match: p => p === '/master', title: 'Mestre' },
    { match: p => p.startsWith('/master/campaigns'), title: 'Campanhas (Mestre)' },
    { match: p => p.startsWith('/master/pdms'), title: 'PDMs' },
    { match: p => p.startsWith('/master/rolls'), title: 'Rolagens (Mestre)' },
    { match: p => p.startsWith('/offline'), title: 'Offline' },
  ]
  const found = maps.find(m => m.match(pathname))
  return found ? found.title : (isMaster ? 'Mestre' : 'pbta.app')
}

function isTopLevel(pathname: string, isMaster: boolean): boolean {
  if (isMaster) {
    return pathname === '/master' || pathname.startsWith('/master/campaigns') || pathname.startsWith('/master/pdms') || pathname.startsWith('/master/rolls')
  }
  return pathname === '/dashboard' || pathname.startsWith('/sheets') || pathname.startsWith('/campaigns') || pathname.startsWith('/roller') || pathname.startsWith('/notes')
}

export default function AppLayout(_props: PropsWithChildren) {
  const location = useLocation()
  const navigate = useNavigate()
  const { isMaster } = useMode()

  const master = isMaster()
  const title = usePageTitle(location.pathname, master)
  const showBack = useMemo(() => !isTopLevel(location.pathname, master), [location.pathname, master])

  return (
    <div style={{ display: 'grid', gridTemplateRows: 'auto 1fr auto', minHeight: '100dvh' }}>
      <header style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--color-neutral-0)', borderBottom: '1px solid var(--color-neutral-200)', padding: 'var(--space-3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          {showBack && (
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)} iconLeft={<span aria-hidden>←</span>}>
              Voltar
            </Button>
          )}
          <h1 style={{ fontSize: 16, margin: 0 }}>{title}</h1>
        </div>
      </header>

      <main style={{ padding: 'var(--space-4)', paddingBottom: 'calc(var(--space-10) + env(safe-area-inset-bottom))' }}>
        <Outlet />
      </main>

      <BottomTabs />
    </div>
  )
}