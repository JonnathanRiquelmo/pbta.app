import { useState } from 'react'
import { Card, CardHeader, CardBody, CardFooter, Button, Input, useToast } from '../common'
import { useAuth } from '../../contexts/AuthContext'
import { roll2d6 } from '../../utils/pbta'
import { createRoll } from '../../services/rolls.service'

export default function DiceRoller() {
  const { user } = useAuth()
  const { push } = useToast()
  const [mod, setMod] = useState(0)
  const [last, setLast] = useState<{ dice: [number, number]; total: number; result: string } | null>(null)

  const canRoll = !!user

  const onRoll = async () => {
    const r = roll2d6(mod)
    setLast(r)
    try {
      await createRoll({ rollerUid: user!.uid, total: r.total, detail: { dice: r.dice, mod, outcome: r.result } })
      push('Rolagem salva')
    } catch (err) {
      push('Falha ao salvar rolagem')
    }
  }

  return (
    <Card>
      <CardHeader>Rolador PBTA</CardHeader>
      <CardBody>
        <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
          <Input type="number" value={mod} onChange={e => setMod(parseInt((e.target as HTMLInputElement).value || '0', 10))} placeholder="Modificador" />
          <Button disabled={!canRoll} onClick={onRoll}>Rolar 2d6</Button>
        </div>
        <div style={{ marginTop: 'var(--space-2)' }}>
          {last ? `D: ${last.dice.join(' + ')} | Total: ${last.total} | Resultado: ${last.result}` : 'Sem rolagem ainda'}
        </div>
      </CardBody>
      <CardFooter>
        {!canRoll && <span style={{ color: 'var(--color-neutral-600)' }}>Faça login para rolar e salvar</span>}
      </CardFooter>
    </Card>
  )
}