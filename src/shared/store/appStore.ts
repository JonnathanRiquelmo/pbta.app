import { create } from 'zustand'
import type { User } from '@auth/types'

type State = {
  user: User | null
  role: User['role'] | null
  currentCampaign: string | null
}

type Actions = {
  setUser: (user: User) => void
  logout: () => void
  setCurrentCampaign: (id: string | null) => void
}

export const useAppStore = create<State & Actions>(set => ({
  user: null,
  role: null,
  currentCampaign: null,
  setUser: user => set({ user, role: user.role }),
  logout: () => set({ user: null, role: null, currentCampaign: null }),
  setCurrentCampaign: id => set({ currentCampaign: id })
}))