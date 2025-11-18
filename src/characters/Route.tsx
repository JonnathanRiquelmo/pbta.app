import { useParams } from 'react-router-dom'
export default function CharacterRoute() {
  const { id } = useParams()
  return <div>Personagem {id}</div>
}