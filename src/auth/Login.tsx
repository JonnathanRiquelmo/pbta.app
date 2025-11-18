import { FormEvent, useState } from 'react'
import { useAuth } from './useAuth'
import { useAppStore } from '@shared/store/appStore'
import { Navigate } from 'react-router-dom'

export default function Login() {
  const { loginGoogle, loginEmail } = useAuth()
  const user = useAppStore(s => s.user)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  if (user) return <Navigate to={user.role === 'master' ? '/dashboard/master' : '/dashboard/player'} replace />

  async function handleGoogle() {
    try {
      await loginGoogle()
    } catch (err) {
      setError((err as Error).message)
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      await loginEmail(email, password)
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <div className="auth">
      <h1>PBTA</h1>
      <div className="card">
        <button onClick={handleGoogle}>Entrar com Google</button>
      </div>
      <form onSubmit={handleSubmit} className="card">
        <input placeholder="email" value={email} onChange={e => setEmail(e.target.value)} />
        <input placeholder="senha" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <button type="submit">Entrar com Email</button>
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  )
}