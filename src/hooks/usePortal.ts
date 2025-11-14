import { useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'

export function usePortal(id = 'modal-root') {
  const el = useMemo(() => document.createElement('div'), [])
  useEffect(() => {
    el.setAttribute('id', id)
    document.body.appendChild(el)
    return () => {
      document.body.removeChild(el)
    }
  }, [el, id])
  const Portal = ({ children }: { children: React.ReactNode }) => createPortal(children, el)
  return { Portal }
}