import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useMode } from '../../contexts/ModeContext'

export default function GoogleLoginButton() {
  const { signInWithGoogle } = useAuth()
  const { isMaster } = useMode()
  const navigate = useNavigate()

  const handleLogin = async () => {
    await signInWithGoogle()
    const goMaster = isMaster()
    navigate(goMaster ? '/master' : '/dashboard', { replace: true })
  }

  return <button onClick={handleLogin}>Entrar com Google</button>
}