import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAppStore } from '@shared/store/appStore'
import type { AttributeScore, PlayerSheet } from './types'
import PlayerCharacterForm from './PlayerCharacterForm'
import BackButton from '@shared/components/BackButton'

export default function CharacterRoute() {
  const { id } = useParams()
  const navigate = useNavigate()
  const campaignId = id || ''
  const user = useAppStore(s => s.user)
  const getMyPlayerSheet = useAppStore(s => s.getMyPlayerSheet)
  const createMyPlayerSheet = useAppStore(s => s.createMyPlayerSheet)
  const updateMyPlayerSheet = useAppStore(s => s.updateMyPlayerSheet)
  const listCampaignMoves = useAppStore(s => s.listCampaignMoves)

  const existing = useMemo(() => (user ? getMyPlayerSheet(campaignId) : undefined), [campaignId, user, getMyPlayerSheet])
  const movesEnabled = useMemo(() => listCampaignMoves(campaignId), [campaignId, listCampaignMoves])

  const handleSubmit = (formData: Omit<PlayerSheet, 'id' | 'userId' | 'campaignId' | 'type'>) => {
    if (!user) return

    if (existing) {
      const res = updateMyPlayerSheet(campaignId, formData)
      if (!res.ok) {
        alert(res.message)
        return
      }
    } else {
      const res = createMyPlayerSheet(campaignId, formData)
      if (!res.ok) {
        alert(res.message)
        return
      }
    }
    
    navigate(`/campaigns/${campaignId}`)
  }

  const handleCancel = () => {
    navigate(`/campaigns/${campaignId}`)
  }

  return (
    <div className="container">
      <header className="flex items-center" style={{ marginBottom: '2rem', gap: '1rem', flexWrap: 'wrap' }}>
        <BackButton />
        <h2>{existing ? 'Minha Ficha' : 'Criar Ficha'}</h2>
      </header>
      
      <div className="card">
        <PlayerCharacterForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          initialData={existing}
          movesEnabled={movesEnabled}
        />
      </div>
    </div>
  )
}
