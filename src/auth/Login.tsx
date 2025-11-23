import { FormEvent, useEffect, useState } from 'react'
import { useAuth } from './useAuth'
import { useAppStore } from '@shared/store/appStore'
import { Navigate, useNavigate, useLocation } from 'react-router-dom'

export default function Login() {
  const { loginGoogle, loginEmail, register } = useAuth()
  const user = useAppStore(s => s.user)
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

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
    <div className="container">
      <h1>PBTA</h1>
      <div className="card">
        <button className="btn btn-primary" onClick={handleGoogle}>Entrar com Google</button>
      </div>

      {import.meta.env.VITE_USE_EMULATORS === 'true' && (
        <div className="card mt-4">
          <h3>Dev Tools (Emulators)</h3>
          <div className="flex" style={{ gap: 'var(--space-4)', flexWrap: 'wrap' }}>
            <button className="btn" onClick={() => register('jonnathan.riquelmo@gmail.com', 'Test1234!')}>Criar Mestre</button>
            <button className="btn" onClick={() => register('player@test.com', 'Test1234!')}>Criar Jogador</button>
            <button className="btn" onClick={() => loginEmail('jonnathan.riquelmo@gmail.com', 'Test1234!')}>Login Mestre</button>
            <button className="btn" onClick={() => loginEmail('player@test.com', 'Test1234!')}>Login Jogador</button>
          </div>
        </div>
      )}

      {!import.meta.env.VITE_USE_EMULATORS && (
        <div className="card mt-4">
          <h3>Dev Tools (Production)</h3>
          <div className="flex" style={{ gap: 'var(--space-4)', flexWrap: 'wrap' }}>
            <button className="btn" onClick={() => loginEmail('master.teste@pbta.dev', 'Test1234!')}>Login Mestre</button>
            <button className="btn" onClick={() => loginEmail('player.teste@pbta.dev', 'Test1234!')}>Login Jogador</button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card mt-4">
        <div className="flex-col gap-4">
          <input placeholder="email" value={email} onChange={e => setEmail(e.target.value)} />
          <input placeholder="senha" type="password" value={password} onChange={e => setPassword(e.target.value)} />
          <button className="btn btn-primary" type="submit">Entrar com Email</button>
          {error && <p className="error">{error}</p>}
        </div>
      </form>
    </div>
  )
}
