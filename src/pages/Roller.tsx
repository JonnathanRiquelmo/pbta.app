import DiceRoller from '../components/roller/DiceRoller'
import RollHistory from '../components/roller/RollHistory'

export default function Roller() {
  return (
    <div style={{ fontFamily: 'system-ui', padding: 24 }}>
      <h2>Rolador PBTA</h2>
      <div style={{ marginTop: 'var(--space-4)' }}>
        <DiceRoller />
      </div>
      <div style={{ marginTop: 'var(--space-4)' }}>
        <RollHistory />
      </div>
    </div>
  )
}