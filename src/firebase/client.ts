import { initializeApp, getApps } from 'firebase/app'
import type { FirebaseOptions } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

export function hasFirebaseConfig(): boolean {
  return Boolean(import.meta.env.VITE_FIREBASE_API_KEY) && Boolean(import.meta.env.VITE_FIREBASE_PROJECT_ID)
}

let _db: ReturnType<typeof getFirestore> | null = null
let _auth: ReturnType<typeof getAuth> | null = null

function init() {
  if (!getApps().length) {
    const config: FirebaseOptions = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY!,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN!,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID!,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID!
    }
    initializeApp(config)
  }
}

export function getDb() {
  if (!hasFirebaseConfig()) return null
  init()
  if (!_db) _db = getFirestore()
  return _db
}

export function getFirebaseAuth() {
  if (!hasFirebaseConfig()) return null
  init()
  if (!_auth) _auth = getAuth()
  return _auth
}
