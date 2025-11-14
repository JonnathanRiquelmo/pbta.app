import { enableIndexedDbPersistence } from 'firebase/firestore'
import { db } from './config'

export const firestorePersistence = enableIndexedDbPersistence(db).catch((err: any) => {
  if (err.code === 'failed-precondition') {
    console.warn('Persistência offline indisponível: múltiplas abas')
  } else if (err.code === 'unimplemented') {
    console.warn('Persistência offline não suportada neste navegador')
  }
})