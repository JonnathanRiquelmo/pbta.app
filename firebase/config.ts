import { initializeApp } from 'firebase/app'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getStorage, connectStorageEmulator } from 'firebase/storage'

const firebaseConfig = {
  apiKey: 'AIzaSyASn0c5-hsGf3AHKMPBa6TZC-_gxLiRzIk',
  authDomain: 'pbta-db.firebaseapp.com',
  projectId: 'pbta-db',
  storageBucket: 'pbta-db.firebasestorage.app',
  messagingSenderId: '233513855012',
  appId: '1:233513855012:web:ee5383570c520bc48a90b1'
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

if (import.meta.env.DEV) {
  connectAuthEmulator(auth, 'http://localhost:9099')
  connectFirestoreEmulator(db, 'localhost', 8080)
  connectStorageEmulator(storage, 'localhost', 9199)
}