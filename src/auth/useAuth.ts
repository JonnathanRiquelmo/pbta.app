import { useAppStore } from '@shared/store/appStore'
import { signInWithEmail, signInWithGoogle, signOut } from './firebase'
import { upsertUser } from './userRepo'

export function useAuth() {
  const setUser = useAppStore(s => s.setUser)
  const logout = useAppStore(s => s.logout)
  async function loginGoogle(email?: string) {
    const u = await signInWithGoogle(email)
    await upsertUser(u)
    setUser(u)
  }
  async function loginEmail(email: string, password: string) {
    const u = await signInWithEmail(email, password)
    await upsertUser(u)
    setUser(u)
  }
  async function doLogout() {
    await signOut()
    logout()
  }
  return { loginGoogle, loginEmail, doLogout }
}