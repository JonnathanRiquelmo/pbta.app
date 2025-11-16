import { useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button } from '../common'
import { useMode } from '../../contexts/ModeContext'
import { useTitle } from '../../contexts/TitleContext'

function isTopLevel(pathname: string, isMaster: boolean): boolean {
  if (isMaster) {
    return pathname === '/master' || pathname.startsWith('/master/campaigns') || pathname.startsWith('/master/pdms') || pathname.startsWith('/master/rolls')
  }
  return pathname === '/dashboard' || pathname.startsWith('/sheets') || pathname.startsWith('/campaigns') || pathname.startsWith('/roller') || pathname.startsWith('/notes')
}

function heuristicTitle(pathname: string, isMaster: boolean): string {
  if (pathname === '/dashboard') return 'Dashboard'
  if (pathname.startsWith('/sheets')) return 'Fichas'
  if (pathname.startsWith('/campaigns') && !pathname.startsWith('/master')) return 'Campanhas'
  if (pathname.startsWith('/roller')) return 'Rolagens'
  if (pathname.startsWith('/profile')) return 'Perfil'
  if (pathname.startsWith('/notes')) return 'Notas'
  if (pathname === '/master') return 'Mestre'
  if (pathname.startsWith('/master/campaigns')) return 'Campanhas (Mestre)'
  if (pathname.startsWith('/master/pdms')) return 'PDMs'
  if (pathname.startsWith('/master/rolls')) return 'Rolagens (Mestre)'
  if (pathname.startsWith('/offline')) return 'Offline'
  return isMaster ? 'Mestre' : 'pbta.app'
}

export default function Header() {
  const { isMaster } = useMode()
  const { title, actions } = useTitle()
  const location = useLocation()
  const navigate = useNavigate()
  const master = isMaster()
  const showBack = useMemo(() => !isTopLevel(location.pathname, master), [location.pathname, master])
  const resolvedTitle = title.trim().length > 0 ? title : heuristicTitle(location.pathname, master)

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--color-neutral-0)', borderBottom: '1px solid var(--color-neutral-200)', padding: 'var(--space-3)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          {showBack && (
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)} iconLeft={<span aria-hidden>←</span>}>
              Voltar
            </Button>
          )}
          <h1 style={{ fontSize: 16, margin: 0 }}>{resolvedTitle}</h1>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          {actions.map(a => (
            <Button key={a.label} variant={a.variant ?? 'secondary'} size="sm" onClick={a.onClick} disabled={a.disabled} iconLeft={a.iconLeft}>{a.label}</Button>
          ))}
        </div>
      </div>
    </header>
  )
}