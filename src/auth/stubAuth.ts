import type { User } from './types'

function computeRole(email: string): User['role'] {
  return email === 'jonnathan.riquelmo@gmail.com' ? 'master' : 'player'
}

export async function signInWithGoogleStub(email?: string): Promise<User> {
  const e = email ?? 'player.teste@pbta.dev'
  const role = computeRole(e)
  return {
    uid: crypto.randomUUID(),
    email: e,
    displayName: role === 'master' ? 'Mestre' : 'Jogador',
    role
  }
}

export async function signInWithEmailStub(email: string, password: string): Promise<User> {
  if (email === 'master.teste@pbta.dev' && password === 'Test1234!') {
    return {
      uid: crypto.randomUUID(),
      email,
      displayName: 'Mestre',
      role: 'master'
    }
  }
  if (email === 'player.teste@pbta.dev' && password === 'Test1234!') {
    return {
      uid: crypto.randomUUID(),
      email,
      displayName: 'Jogador',
      role: 'player'
    }
  }
  throw new Error('credenciais de teste inválidas')
}

export async function signOutStub(): Promise<void> {
  return
}