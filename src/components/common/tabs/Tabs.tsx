import { KeyboardEvent, useState } from 'react'
import './tabs.css'

type TabItem = { id: string; label: string; content: React.ReactNode }

type TabsProps = {
  items: TabItem[]
  value?: string
  onChange?: (id: string) => void
}

export default function Tabs({ items, value, onChange }: TabsProps) {
  const [current, setCurrent] = useState(items[0]?.id)
  const active = value ?? current
  function select(id: string) {
    setCurrent(id)
    onChange?.(id)
  }
  function onKey(e: KeyboardEvent<HTMLButtonElement>, idx: number) {
    if (e.key === 'ArrowRight') {
      const next = items[(idx + 1) % items.length]
      select(next.id)
    } else if (e.key === 'ArrowLeft') {
      const prev = items[(idx - 1 + items.length) % items.length]
      select(prev.id)
    } else if (e.key === 'Home') {
      select(items[0].id)
    } else if (e.key === 'End') {
      select(items[items.length - 1].id)
    }
  }
  return (
    <div className="tabs">
      <div role="tablist" aria-label="Tabs" className="tabs-list">
        {items.map((t, i) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={active === t.id}
            aria-controls={`panel-${t.id}`}
            id={`tab-${t.id}`}
            className={active === t.id ? 'tab tab-active' : 'tab'}
            onClick={() => select(t.id)}
            onKeyDown={(e) => onKey(e, i)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {items.map((t) => (
        <div
          key={t.id}
          role="tabpanel"
          id={`panel-${t.id}`}
          aria-labelledby={`tab-${t.id}`}
          hidden={active !== t.id}
          className="tab-panel"
        >
          {t.content}
        </div>
      ))}
    </div>
  )
}