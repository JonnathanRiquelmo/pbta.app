import { addDoc, collection } from 'firebase/firestore'
import { auth, db } from '../../firebase/config'

type InitOptions = { enabled?: boolean }

let analyticsEnabled = true

export function initAnalytics(options?: InitOptions) {
  const { enabled = true } = options ?? {}
  analyticsEnabled = !!enabled
}

export async function logEvent(name: string, params?: Record<string, unknown>) {
  if (!analyticsEnabled) return
  const uid = auth.currentUser?.uid ?? null
  if (!db) return
  const payload = {
    name,
    uid,
    params: params ?? {},
    timestamp: new Date()
  }
  try {
    await addDoc(collection(db, 'analytics_events'), payload)
  } catch {
    void 0
  }
}