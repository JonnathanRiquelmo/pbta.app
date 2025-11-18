import { useAuth } from '@auth/useAuth'
import { useAppStore } from '@shared/store/appStore'

export function Header() {
  const { doLogout } = useAuth()
  const user = useAppStore(s => s.user)
  return (
    <header className="header">
      <div className="title">PBTA</div>
      <div className="spacer" />
      {user && (
        <button onClick={doLogout}>Sair</button>
      )}
    </header>
  )
}