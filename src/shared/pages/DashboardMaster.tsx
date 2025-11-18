export default function DashboardMaster() {
  const campaigns = [
    { id: 'c-1', name: 'Campanha Alfa' },
    { id: 'c-2', name: 'Campanha Beta' },
    { id: 'c-3', name: 'Campanha Gama' }
  ]

  return (
    <div>
      <h2>Dashboard do Mestre</h2>

      <div className="card">
        <strong>Ações rápidas</strong>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button type="button">Criar campanha</button>
          <button type="button">Movimentos</button>
          <button type="button">Sessões</button>
        </div>
      </div>

      <div className="card">
        <strong>Suas campanhas</strong>
        <ul>
          {campaigns.map(c => (
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
    </div>
  )
}