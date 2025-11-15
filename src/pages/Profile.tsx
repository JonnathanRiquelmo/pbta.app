import { Card, CardHeader, CardBody } from '../components/common'
import RollHistory from '../components/roller/RollHistory'

export default function Profile() {
  return (
    <div style={{ fontFamily: 'system-ui', padding: 24 }}>
      <h2>Perfil</h2>
      <div style={{ marginTop: 'var(--space-4)' }}>
        <Card>
          <CardHeader>Meu histórico de rolagens</CardHeader>
          <CardBody>
            <RollHistory />
          </CardBody>
        </Card>
      </div>
    </div>
  )
}