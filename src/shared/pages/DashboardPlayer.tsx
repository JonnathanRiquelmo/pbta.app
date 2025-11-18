export default function DashboardPlayer() {
  const acceptedCampaigns = [
    { id: 'c-10', name: 'Campanha Delta' },
    { id: 'c-12', name: 'Campanha Épsilon' }
  ]
  const hasCharacter = false

  return (
    <div>
      <h2>Dashboard do Jogador</h2>

      <div className="card">
        <strong>Token de convite</strong>
        <input placeholder="Cole o token de convite" />
        <button type="button">Usar token</button>
      </div>

      <div className="card">
        <strong>Suas campanhas</strong>
        <ul>
          {acceptedCampaigns.map(c => (
            <li key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>{c.name}</span>
              <span style={{ color: 'var(--muted)' }}>#{c.id}</span>
              <div style={{ flex: 1 }} />
              <button type="button" disabled>
                Abrir
              </button>
            </li>
          ))}
        </ul>
      </div>

      {!hasCharacter && (
        <div className="card">
          <strong>Você ainda não tem ficha</strong>
          <button type="button">Criar sua Ficha</button>
        </div>
      )}
    </div>
  )
}