import type { Roll, CreateRollInput } from './types'

export type RollRepo = {
  listBySession: (sessionId: string) => Roll[]
  create: (sessionId: string, createdBy: string, data: CreateRollInput) => { ok: true; roll: Roll } | { ok: false; message: string }
  remove: (sessionId: string, id: string) => { ok: true } | { ok: false; message: string }
}