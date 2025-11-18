import type { Session } from './types'
import type { CreateSessionInput, UpdateSessionPatch } from './types'

export type SessionRepo = {
  listByCampaign: (campaignId: string) => Session[]
  getById: (id: string) => Session | undefined
  create: (
    campaignId: string,
    createdBy: string,
    data: CreateSessionInput
  ) => { ok: true; session: Session } | { ok: false; message: string }
  update: (
    campaignId: string,
    id: string,
    patch: UpdateSessionPatch
  ) => { ok: true; session: Session } | { ok: false; message: string }
  remove: (campaignId: string, id: string) => { ok: true } | { ok: false; message: string }
}