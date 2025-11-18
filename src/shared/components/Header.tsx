import { useAuth } from '@auth/useAuth'
import { useAppStore } from '@shared/store/appStore'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

export function Header() {
  const { doLogout } = useAuth()
  const user = useAppStore(s => s.user)
  const [installPrompt, setInstallPrompt] = useState<any>(null)
  const { t } = useTranslation()
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
      <div className="title">{t('app.title')}</div>
      <div className="spacer" />
      {installPrompt && (
        <button type="button" onClick={() => {
          installPrompt.prompt()
          installPrompt.userChoice.finally(() => setInstallPrompt(null))
        }}>{t('actions.install')}</button>
      )}
      {user && (
        <button type="button" onClick={doLogout} aria-label={t('actions.logout')}>{t('actions.logout')}</button>
      )}
    </header>
  )
}