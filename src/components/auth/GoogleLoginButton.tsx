import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useMode } from '../../contexts/ModeContext'
import { Button } from '../common'

export default function GoogleLoginButton() {
  const { signInWithGoogle } = useAuth()
  const { isMaster } = useMode()
  const navigate = useNavigate()

  const handleLogin = async () => {
    await signInWithGoogle()
    const goMaster = isMaster()
    navigate(goMaster ? '/master' : '/dashboard', { replace: true })
  }

  return <Button variant="primary" onClick={handleLogin}>Entrar com Google</Button>
}