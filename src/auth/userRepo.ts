import type { User } from './types'

type UserRecord = {
  uid: string
  email: string
  displayName: string
  role: User['role']
  createdAt: string
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
  return record
}

export function getUser(uid: string): UserRecord | undefined {
  return usersByUid[uid]
}