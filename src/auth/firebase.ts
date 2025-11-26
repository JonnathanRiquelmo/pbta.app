import type { User } from './types'
import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, signOut as fbSignOut } from 'firebase/auth'
import { getFirebaseAuth } from '../firebase/client'

export function mapUser(u: { uid: string; email: string | null; displayName: string | null }): User {
  const email = u.email ?? 'player.teste@pbta.dev'

  // Master role for specific emails
  const isMaster = email === 'jonnathan.riquelmo@gmail.com' || email === 'master.teste@pbta.dev'
  const role: User['role'] = isMaster ? 'master' : 'player'

  return {
    uid: u.uid,
    email,
    displayName: u.displayName ?? (role === 'master' ? 'Mestre' : 'Jogador'),
    role,
    createdAt: new Date().toISOString()
  }
}

export async function signInWithGoogle(_email?: string): Promise<User> {
  const auth = getFirebaseAuth()
  if (!auth) throw new Error('Firebase not initialized')

  const provider = new GoogleAuthProvider()
  const res = await signInWithPopup(auth, provider)
  return mapUser(res.user)
}

export async function signInWithEmail(email: string, password: string): Promise<User> {
  const auth = getFirebaseAuth()
  if (!auth) throw new Error('Firebase not initialized')

  const res = await signInWithEmailAndPassword(auth, email, password)
  return mapUser(res.user)
}

export async function signOut(): Promise<void> {
  const auth = getFirebaseAuth()
  if (!auth) return
  await fbSignOut(auth)
}
