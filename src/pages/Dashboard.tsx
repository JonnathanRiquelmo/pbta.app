import PlayerDashboard from '../components/dashboard/PlayerDashboard'
import { useEffect } from 'react'
import { useTitle } from '../contexts/TitleContext'

export default function Dashboard() {
  const { setTitle } = useTitle()
  useEffect(() => { setTitle('Dashboard') }, [setTitle])
  return (
    <div style={{ padding: 'var(--space-4)' }}>
      <PlayerDashboard />
    </div>
  )
}