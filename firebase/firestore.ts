import { enableIndexedDbPersistence } from 'firebase/firestore'
import { db } from './config'

export const firestorePersistence = enableIndexedDbPersistence(db).catch((err: unknown) => {
  const code = (err as { code?: string })?.code
  if (code === 'failed-precondition') {
    console.warn('Persistência offline indisponível: múltiplas abas')
  } else if (code === 'unimplemented') {
    console.warn('Persistência offline não suportada neste navegador')
  }
})