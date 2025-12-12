import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@shared/store/appStore'
import { LuChevronLeft } from 'react-icons/lu'

type Props = {
  label?: string
  to?: string
}

export default function BackButton({ label = 'Voltar', to }: Props) {
  const navigate = useNavigate()
  const role = useAppStore(s => s.role)

  function handleBack() {
    const fallback = to || (role === 'master' ? '/dashboard/master' : '/dashboard/player')
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate(fallback)
    }
  }

  return (
    <button className="btn btn-ghost" onClick={handleBack} aria-label="Voltar" style={{ paddingLeft: '8px', paddingRight: '12px' }}>
      <LuChevronLeft size={20} style={{ marginRight: 4 }} />
      {label}
    </button>
  )
}

