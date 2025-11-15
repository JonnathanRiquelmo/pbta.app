import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import GoogleLoginButton from '../components/auth/GoogleLoginButton'
import EmailLoginForm from '../components/auth/EmailLoginForm'
import { Card, CardBody, CardHeader, Spinner } from '../components/common'
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
  }, [loading, user, isMaster, navigate])
  return (
    <div style={{ padding: 24 }}>
      <Card>
        <CardHeader>Login</CardHeader>
        <CardBody>
          {loading ? (
            <Spinner label="Carregando" />
          ) : (
            <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
              <GoogleLoginButton />
              <EmailLoginForm />
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}