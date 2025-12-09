import type { Roll, CreateRollInput } from './types'

export type RollRepo = {
  listBySession: (sessionId: string) => Promise<Roll[]>
  create: (sessionId: string, data: CreateRollInput) => Promise<{ ok: true; roll: Roll } | { ok: false; message: string }>
  remove: (sessionId: string, id: string) => Promise<{ ok: true } | { ok: false; message: string }>
}

export type SubscribeRollsRepo = {
  subscribe: (sessionId: string, campaignId: string, cb: (items: Roll[]) => void) => () => void
}