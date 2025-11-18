import { FormEvent, useEffect, useState } from 'react'
import { useAuth } from './useAuth'
import { useAppStore } from '@shared/store/appStore'
import { Navigate, useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function Login() {
  const { loginGoogle, loginEmail } = useAuth()
  const user = useAppStore(s => s.user)
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const { t } = useTranslation()

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const token = params.get('invite')
    if (token) {
      sessionStorage.setItem('pbta_invite_token', token)
      if (user && user.role === 'player') {
        navigate(`/invite?invite=${token}`, { replace: true })
      }
    }
  }, [location.search, user, navigate])

  if (user) return <Navigate to={user.role === 'master' ? '/dashboard/master' : '/dashboard/player'} replace />

  async function handleGoogle() {
    try {
      await loginGoogle()
      const token = sessionStorage.getItem('pbta_invite_token')
      if (token) {
        navigate(`/invite?invite=${token}`, { replace: true })
        return
      }
    } catch (err) {
      setError((err as Error).message)
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      await loginEmail(email, password)
      const token = sessionStorage.getItem('pbta_invite_token')
      if (token) {
        navigate(`/invite?invite=${token}`, { replace: true })
        return
      }
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <div className="auth">
      <h1>{t('login.title')}</h1>
      <div className="card">
        <button type="button" onClick={handleGoogle}>{t('login.google')}</button>
      </div>
      <form onSubmit={handleSubmit} className="card">
        <label htmlFor="login-email">{t('login.email')}</label>
        <input id="login-email" value={email} onChange={e => setEmail(e.target.value)} />
        <label htmlFor="login-password">{t('login.password')}</label>
        <input id="login-password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <button type="submit">{t('login.submit')}</button>
        {error && <p className="error" role="alert" aria-live="assertive">{error}</p>}
      </form>
    </div>
  )
}