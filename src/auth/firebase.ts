import type { User } from './types'
import { getApp, getApps, initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, signOut as fbSignOut } from 'firebase/auth'

const hasFirebaseConfig = () => Boolean(import.meta.env.VITE_FIREBASE_API_KEY)

function ensureFirebaseApp() {
  if (!hasFirebaseConfig()) return null
  const config = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string
  }
  if (!getApps().length) initializeApp(config)
  return getApp()
}

function mapUser(u: { uid: string; email: string | null; displayName: string | null }): User {
  const email = u.email ?? 'player.teste@pbta.dev'
  const role: User['role'] = email === 'jonnathan.riquelmo@gmail.com' ? 'master' : 'player'
  return {
    uid: u.uid,
    email,
    displayName: u.displayName ?? (role === 'master' ? 'Mestre' : 'Jogador'),
    role,
    createdAt: new Date().toISOString()
  }
}

export async function signInWithGoogle(email?: string): Promise<User> {
  if (!hasFirebaseConfig()) return (await import('./stubAuth')).signInWithGoogleStub(email)
  ensureFirebaseApp()
  const auth = getAuth()
  const provider = new GoogleAuthProvider()
  const res = await signInWithPopup(auth, provider)
  return mapUser(res.user)
}

export async function signInWithEmail(email: string, password: string): Promise<User> {
  if (!hasFirebaseConfig()) return (await import('./stubAuth')).signInWithEmailStub(email, password)
  ensureFirebaseApp()
  const auth = getAuth()
  const res = await signInWithEmailAndPassword(auth, email, password)
  return mapUser(res.user)
}

export async function signOut(): Promise<void> {
  if (!hasFirebaseConfig()) return (await import('./stubAuth')).signOutStub()
  ensureFirebaseApp()
  const auth = getAuth()
  await fbSignOut(auth)
}
