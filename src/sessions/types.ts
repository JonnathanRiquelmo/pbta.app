export type Session = {
  id: string
  campaignId: string
  name: string
  date: number
  masterNotes: string
  summary: string
  createdAt: number
  createdBy: string
  updatedAt: number
}

export type CreateSessionInput = {
  name: string
  date: number
  masterNotes?: string
  summary?: string
}

export type UpdateSessionPatch = Partial<{
  name: string
  date: number
  masterNotes: string
  summary: string
}>