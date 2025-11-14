import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import GoogleLoginButton from '../components/auth/GoogleLoginButton'
import { useAuth } from '../contexts/AuthContext'
import { useMode } from '../contexts/ModeContext'

export default function Login() {
  const { user, loading } = useAuth()
  const { isMaster } = useMode()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && user) {
      const goMaster = isMaster()
      navigate(goMaster ? '/master' : '/dashboard', { replace: true })
    }
  }, [loading, user])
  return (
    <div style={{ fontFamily: 'system-ui', padding: 24 }}>
      <h2>Login</h2>
      {loading ? (
        <div>Carregando...</div>
      ) : (
        <GoogleLoginButton />
      )}
    </div>
  )
}