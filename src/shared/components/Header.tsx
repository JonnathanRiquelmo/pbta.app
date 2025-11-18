import { useAuth } from '@auth/useAuth'
import { useAppStore } from '@shared/store/appStore'
import { useEffect, useState } from 'react'

export function Header() {
  const { doLogout } = useAuth()
  const user = useAppStore(s => s.user)
  const [installPrompt, setInstallPrompt] = useState<any>(null)
  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault()
      setInstallPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])
  return (
    <header className="header">
      <div className="title">PBTA</div>
      <div className="spacer" />
      {installPrompt && (
        <button onClick={() => {
          installPrompt.prompt()
          installPrompt.userChoice.finally(() => setInstallPrompt(null))
        }}>Instalar App</button>
      )}
      {user && (
        <button onClick={doLogout}>Sair</button>
      )}
    </header>
  )
}