export type AttributeScore = -1 | 0 | 1 | 2 | 3

export type Attributes = {
  forca: AttributeScore
  agilidade: AttributeScore
  sabedoria: AttributeScore
  carisma: AttributeScore
  intuicao: AttributeScore
}

export type PlayerSheet = {
  id: string
  campaignId: string
  userId: string
  name: string
  background: string
  attributes: Attributes
  equipment: string
  notes: string
  moves: string[]
  createdAt: number
  updatedAt: number
}