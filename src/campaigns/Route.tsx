import { useParams } from 'react-router-dom'
import { useAppStore } from '@shared/store/appStore'

export default function CampaignRoute() {
  const { id } = useParams()
  const setCurrentCampaign = useAppStore(s => s.setCurrentCampaign)
  if (id) setCurrentCampaign(id)
  return <div>Campanha {id}</div>
}