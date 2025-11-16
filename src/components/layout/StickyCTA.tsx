import { ReactNode } from 'react'
import { Button } from '../common'

type StickyCTAProps = {
  primaryLabel: string
  onPrimaryClick: () => void
  primaryDisabled?: boolean
  secondary?: Array<{ label: string; onClick: () => void; disabled?: boolean }>
}

export default function StickyCTA({ primaryLabel, onPrimaryClick, primaryDisabled, secondary }: StickyCTAProps) {
  return (
    <div style={{ position: 'sticky', bottom: 0, zIndex: 9, background: 'var(--color-neutral-0)', borderTop: '1px solid var(--color-neutral-200)', padding: 'var(--space-3)', display: 'grid', gap: 'var(--space-2)', paddingBottom: 'calc(var(--space-3) + env(safe-area-inset-bottom))' }}>
      <Button onClick={onPrimaryClick} disabled={!!primaryDisabled} size="lg" fullWidth>{primaryLabel}</Button>
      {secondary && secondary.length > 0 && (
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          {secondary.map((s) => (
            <Button key={s.label} onClick={s.onClick} disabled={!!s.disabled} variant="secondary">{s.label}</Button>
          ))}
        </div>
      )}
    </div>
  )
}