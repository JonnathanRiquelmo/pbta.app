import type { User } from './types'

type UserRecord = {
  uid: string
  email: string
  displayName: string
  role: User['role']
  createdAt: string
}

// Função para buscar dados do users.json como fallback
async function getUserFromJson(uid: string): Promise<UserRecord | null> {
  try {
    // Dados hardcoded do users.json para teste
    const usersData = {
      "users": [
        {
          "localId": "YIGVsd45BSQMPZMUI9nF7Ko9jYL2",
          "email": "player.teste@pbta.dev",
          "displayName": "Player Teste"
        },
        {
          "localId": "yUTXL24VUkg9bZnXMBgysirS2ZG3",
          "email": "jonnathan.riquelmo@gmail.com",
          "displayName": "Jonnathan Riquelmo"
        }
      ]
    }
    
    const user = usersData.users.find((u: any) => u.localId === uid)
    
    if (user) {
      return {
        uid: user.localId,
        email: user.email,
        displayName: user.displayName || user.email.split('@')[0], // Usa o email como fallback
        role: 'player', // Assume player por padrão
        createdAt: new Date().toISOString()
      }
    }
  } catch (error) {
    console.error('Erro ao buscar usuário do users.json:', error)
  }
  return null
}

const usersByUid: Record<string, UserRecord> = {}

export async function upsertUser(user: User): Promise<UserRecord> {
  const existing = usersByUid[user.uid]
  const record: UserRecord = {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    role: user.role,
    createdAt: existing?.createdAt ?? user.createdAt ?? new Date().toISOString()
  }
  usersByUid[user.uid] = record
  
  // Também salva no Firestore
  try {
    const { getFirestore, doc, setDoc } = await import('firebase/firestore')
    const db = getFirestore()
    await setDoc(doc(db, 'users', user.uid), record)
  } catch (error) {
    console.error('Erro ao salvar usuário no Firestore:', error)
  }
  
  return record
}

export function getUser(uid: string): UserRecord | undefined {
  return usersByUid[uid]
}

export async function getUserFromAuth(uid: string): Promise<UserRecord | null> {
  try {
    const { getAuth } = await import('firebase/auth')
    const auth = getAuth()
    if (!auth) return null
    
    // Tenta buscar do cache primeiro
    const cached = usersByUid[uid]
    if (cached) return cached
    
    // Se não estiver no cache, busca do Firestore
    try {
      const { getFirestore, doc, getDoc } = await import('firebase/firestore')
      const db = getFirestore()
      const userDoc = await getDoc(doc(db, 'users', uid))
      
      if (userDoc.exists()) {
        const userData = userDoc.data() as UserRecord
        // Adiciona ao cache local
        usersByUid[uid] = userData
        return userData
      }
    } catch (firestoreError) {
      console.error('Erro ao buscar usuário do Firestore:', firestoreError)
    }
    
    // Se não encontrar no Firestore, tenta buscar do users.json
    const userFromJson = await getUserFromJson(uid)
    if (userFromJson) {
      // Adiciona ao cache local
      usersByUid[uid] = userFromJson
      return userFromJson
    }
    
    // Se não encontrar em lugar nenhum, retorna dados básicos
    return {
      uid,
      email: `${uid.substring(0, 8)}@user.local`,
      displayName: `Jogador #${uid.substring(0, 8)}`,
      role: 'player',
      createdAt: new Date().toISOString()
    }
  } catch (error) {
    console.error('Erro ao buscar usuário:', error)
    return null
  }
}