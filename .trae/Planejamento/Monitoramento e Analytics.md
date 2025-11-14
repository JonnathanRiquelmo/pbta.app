# Monitoramento e Analytics — pbta.app

## 13. Monitoramento e Analytics

### 13.1 Eventos de Analytics

```typescript
// utils/analytics.ts
import { getAnalytics, logEvent } from 'firebase/analytics'

export function trackSheetCreated(sheetId: string) {
  logEvent(getAnalytics(), 'sheet_created', { sheet_id: sheetId })
}

export function trackRollCreated(interpretation: string) {
  logEvent(getAnalytics(), 'roll_created', { interpretation })
}

export function trackSessionCreated(isPublic: boolean) {
  logEvent(getAnalytics(), 'session_created', { is_public: isPublic })
}
```

### 13.2 Performance Monitoring

```typescript
// utils/performance.ts
import { getPerformance, trace } from 'firebase/performance'

export function traceOperation<T>(name: string, operation: () => Promise<T>) {
  const perf = getPerformance()
  const t = trace(perf, name)
  t.start()
  return operation().finally(() => t.stop())
}
```

### 13.3 Diretrizes

- Registrar eventos somente no cliente e após o `initializeApp`.
- Padronizar nomes de eventos (`snake_case`) e parâmetros.
- Evitar envio em desenvolvimento; preferir produção para métricas reais.
- Usar `traceOperation` em operações críticas (login, salvar ficha, rolagem).