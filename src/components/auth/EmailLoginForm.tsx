import { useState } from 'react'
import { Button, Input } from '../common'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useMode } from '../../contexts/ModeContext'

export default function EmailLoginForm() {
  const { signInWithEmail, signUpWithEmail } = useAuth()
  const { isMaster } = useMode()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const canSubmit = email.includes('@') && password.length >= 6 && !loading

  const handleLogin = async () => {
    if (!canSubmit) return
    setLoading(true)
    try {
      await signInWithEmail(email.trim(), password)
      const goMaster = isMaster(email.trim())
      navigate(goMaster ? '/master' : '/dashboard', { replace: true })
    } catch {
      void 0
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async () => {
    if (!canSubmit) return
    setLoading(true)
    try {
      await signUpWithEmail(email.trim(), password)
      const goMaster = isMaster(email.trim())
      navigate(goMaster ? '/master' : '/dashboard', { replace: true })
    } catch {
      void 0
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
      <Input label="E-mail" value={email} onChange={e => setEmail(e.target.value)} disabled={loading} required />
      <Input label="Senha" type="password" value={password} onChange={e => setPassword(e.target.value)} disabled={loading} required />
      <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
        <Button onClick={handleLogin} disabled={!canSubmit} loading={loading}>Entrar</Button>
        <Button onClick={handleSignup} disabled={!canSubmit} variant="secondary" loading={loading}>Cadastrar</Button>
      </div>
    </div>
  )
}