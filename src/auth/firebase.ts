import type { User } from './types'

const hasFirebaseConfig = () => {
  return Boolean(import.meta.env.VITE_FIREBASE_API_KEY)
}

export async function signInWithGoogle(email?: string): Promise<User> {
  if (!hasFirebaseConfig()) return (await import('./stubAuth')).signInWithGoogleStub(email)
  throw new Error('Firebase não configurado nesta base')
}

export async function signInWithEmail(email: string, password: string): Promise<User> {
  if (!hasFirebaseConfig()) return (await import('./stubAuth')).signInWithEmailStub(email, password)
  throw new Error('Firebase não configurado nesta base')
}

export async function signOut(): Promise<void> {
  if (!hasFirebaseConfig()) return (await import('./stubAuth')).signOutStub()
  throw new Error('Firebase não configurado nesta base')
}