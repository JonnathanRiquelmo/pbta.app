import { initializeApp, getApps } from 'firebase/app'
import type { FirebaseOptions } from 'firebase/app'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getAuth, connectAuthEmulator } from 'firebase/auth'

export function hasFirebaseConfig(): boolean {
  // In emulator mode we force the config to be considered present
  return Boolean(import.meta.env.VITE_FIREBASE_API_KEY) || import.meta.env.VITE_USE_EMULATORS === 'true';
}

let _db: ReturnType<typeof getFirestore> | null = null
let _auth: ReturnType<typeof getAuth> | null = null
let _emulatorsConnected = false

function init() {
  if (!getApps().length) {
    const config: FirebaseOptions = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? 'fake-api-key',
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? 'localhost',
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? 'demo-project',
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? '',
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '123456',
      appId: import.meta.env.VITE_FIREBASE_APP_ID ?? 'fake-app-id'
    };
    initializeApp(config);
  }

  // Connect emulators once after app initialization
  if (import.meta.env.VITE_USE_EMULATORS === 'true' && !_emulatorsConnected) {
    try {
      const db = getFirestore();
      const auth = getAuth();
      connectFirestoreEmulator(db, 'localhost', 8080);
      connectAuthEmulator(auth, 'http://localhost:9099');
      _emulatorsConnected = true;
      console.log('Firebase emulators connected');
    } catch (e) {
      console.warn('Failed to connect Firebase emulators', e);
    }
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
