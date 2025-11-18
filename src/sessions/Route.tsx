import { useParams } from 'react-router-dom'
export default function SessionRoute() {
  const { id } = useParams()
  return <div>Sessão {id}</div>
}