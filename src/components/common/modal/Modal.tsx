import { useEffect, useRef } from 'react'
import { usePortal } from '../../../hooks/usePortal'
import './modal.css'

type ModalProps = {
  open: boolean
  onClose: () => void
  title?: string
  children?: React.ReactNode
}

export default function Modal({ open, onClose, title, children }: ModalProps) {
  const { Portal } = usePortal('modal-root')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    if (open) {
      document.addEventListener('keydown', onKey)
      const el = ref.current
      const focusable = el?.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      focusable?.focus()
    }
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null
  return (
    <Portal>
      <div className="modal-backdrop" onClick={onClose} />
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        ref={ref}
      >
        {title ? <div id="modal-title" className="modal-title">{title}</div> : null}
        <div className="modal-body">{children}</div>
        <div className="modal-actions">
          <button className="modal-close" onClick={onClose}>Fechar</button>
        </div>
      </div>
    </Portal>
  )
}