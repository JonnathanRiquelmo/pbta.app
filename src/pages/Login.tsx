import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { auth } from '../../firebase/config'

export default function Login() {
  const handleLogin = async () => {
    const provider = new GoogleAuthProvider()
    await signInWithPopup(auth, provider)
  }
  return (
    <div style={{ fontFamily: 'system-ui', padding: 24 }}>
      <h2>Login</h2>
      <button onClick={handleLogin}>Entrar com Google</button>
    </div>
  )
}