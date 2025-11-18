export type Move = {
  id: string
  campaignId: string
  name: string
  description: string
  modifier: -1 | 0 | 1 | 2 | 3
  active: boolean
  createdAt: number
  updatedAt: number
}