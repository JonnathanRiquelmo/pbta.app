export type Role = 'master' | 'player'

export type User = {
  uid: string
  email: string
  displayName: string
  role: Role
}