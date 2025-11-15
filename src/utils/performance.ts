import { addDoc, collection } from 'firebase/firestore'
import { auth, db } from '../../firebase/config'

type InitOptions = { enabled?: boolean }

let perfEnabled = true

export function initPerformance(options?: InitOptions) {
  const { enabled = true } = options ?? {}
  perfEnabled = !!enabled
}

export async function traceOperation<T>(name: string, fn: () => Promise<T>, meta?: Record<string, unknown>): Promise<T> {
  const start = performance.now()
  let ok = true
  try {
    const result = await fn()
    const durationMs = performance.now() - start
    if (perfEnabled && db) {
      const uid = auth.currentUser?.uid ?? null
      const payload = { name, durationMs, ok: true, meta: meta ?? {}, uid, timestamp: new Date() }
      try { await addDoc(collection(db, 'performance_traces'), payload) } catch { void 0 }
    }
    return result
  } catch (err) {
    ok = false
    const durationMs = performance.now() - start
    if (perfEnabled && db) {
      const uid = auth.currentUser?.uid ?? null
      const payload = { name, durationMs, ok: false, meta: meta ?? {}, uid, timestamp: new Date() }
      try { await addDoc(collection(db, 'performance_traces'), payload) } catch { void 0 }
    }
    throw err
  }
}