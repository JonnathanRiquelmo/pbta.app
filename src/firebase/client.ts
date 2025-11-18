import { initializeApp, getApps } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

export function hasFirebaseConfig(): boolean {
  return Boolean(import.meta.env.VITE_FIREBASE_API_KEY)
}

let _db: ReturnType<typeof getFirestore> | null = null

export function getDb() {
  if (!hasFirebaseConfig()) return null
  if (_db) return _db
  if (!getApps().length) {
    initializeApp({
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID
    } as any)
  }
  _db = getFirestore()
  return _db
}