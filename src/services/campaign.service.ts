import { addDoc, collection, deleteDoc, doc, updateDoc } from 'firebase/firestore'
import { db } from '../../firebase/config'

export type CampaignInput = {
  name: string
  description?: string
  ruleSet: string
  players?: string[]
}

export async function createCampaign(input: CampaignInput, ownerUid: string): Promise<string> {
  const ref = await addDoc(collection(db, 'campaigns'), {
    ownerUid,
    name: input.name,
    description: input.description ?? '',
    ruleSet: input.ruleSet,
    players: input.players ?? [],
    creationDate: new Date()
  })
  return ref.id
}

export async function updateCampaign(id: string, partial: Partial<CampaignInput>): Promise<void> {
  await updateDoc(doc(db, 'campaigns', id), partial)
}

export async function deleteCampaign(id: string): Promise<void> {
  await deleteDoc(doc(db, 'campaigns', id))
}

export async function updateCampaignPlot(id: string, plot: string): Promise<void> {
  const value = (plot ?? '').trim().slice(0, 10000)
  await updateDoc(doc(db, 'campaigns', id), { plot: value })
}