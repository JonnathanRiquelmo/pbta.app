import { useAppStore } from '@shared/store/appStore'
import { signInWithEmail, signInWithGoogle, signOut } from './firebase'
import { upsertUser } from './userRepo'
import type { User } from './types'
import { logger } from '@shared/utils/logger'

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

  async function register(email: string, password: string) {
    logger.info('Registering user:', email)
    try {
      const { createUserWithEmailAndPassword } = await import('firebase/auth')
      const { getFirebaseAuth } = await import('../firebase/client')
      const auth = getFirebaseAuth()
      if (!auth) throw new Error('No auth')

      logger.info('Creating user in Firebase Auth...')
      const res = await createUserWithEmailAndPassword(auth, email, password)
      logger.info('User created:', res.user.uid)

      const u: User = {
        uid: res.user.uid,
        email: res.user.email ?? email,
        displayName: res.user.displayName ?? (email === 'jonnathan.riquelmo@gmail.com' ? 'Mestre' : 'Jogador'),
        role: email === 'jonnathan.riquelmo@gmail.com' ? 'master' : 'player',
        createdAt: new Date().toISOString()
      }

      logger.info('Upserting user to DB...')
      await upsertUser(u)
      logger.info('User upserted, setting state...')
      setUser(u)
    } catch (error) {
      logger.error('Registration failed:', error)
      throw error
    }
  }

  return { loginGoogle, loginEmail, doLogout, register }
}