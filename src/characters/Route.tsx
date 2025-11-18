import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAppStore } from '@shared/store/appStore'
import type { AttributeScore, PlayerSheet } from './types'
import { useTranslation } from 'react-i18next'

function rangeScores(): AttributeScore[] {
  return [-1, 0, 1, 2, 3]
}

function sumAbs(a: number[]): number {
  return a.reduce((acc, v) => acc + Math.abs(v), 0)
}

export default function CharacterRoute() {
  const { id } = useParams()
  const campaignId = id || ''
  const user = useAppStore(s => s.user)
  const getMyPlayerSheet = useAppStore(s => s.getMyPlayerSheet)
  const createMyPlayerSheet = useAppStore(s => s.createMyPlayerSheet)
  const updateMyPlayerSheet = useAppStore(s => s.updateMyPlayerSheet)
  const listCampaignMoves = useAppStore(s => s.listCampaignMoves)

  const existing = useMemo(() => (user ? getMyPlayerSheet(campaignId) : undefined), [campaignId, user, getMyPlayerSheet])
  const [name, setName] = useState(existing?.name || '')
  const [background, setBackground] = useState(existing?.background || '')
  const [attributes, setAttributes] = useState<PlayerSheet['attributes']>({
    forca: existing?.attributes.forca ?? 0,
    agilidade: existing?.attributes.agilidade ?? 0,
    sabedoria: existing?.attributes.sabedoria ?? 0,
    carisma: existing?.attributes.carisma ?? 0,
    intuicao: existing?.attributes.intuicao ?? 0
  })
  const [equipment, setEquipment] = useState(existing?.equipment || '')
  const [notes, setNotes] = useState(existing?.notes || '')
  const movesEnabled = useMemo(() => listCampaignMoves(campaignId), [campaignId, listCampaignMoves])
  const [selectedMoves, setSelectedMoves] = useState<string[]>(existing?.moves || [])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const { t } = useTranslation()

  useEffect(() => {
    if (existing) {
      setName(existing.name)
      setBackground(existing.background)
      setAttributes(existing.attributes)
      setEquipment(existing.equipment)
      setNotes(existing.notes)
      setSelectedMoves(existing.moves)
    }
  }, [existing])

  const currentSum = sumAbs([
    attributes.forca,
    attributes.agilidade,
    attributes.sabedoria,
    attributes.carisma,
    attributes.intuicao
  ])
  const remaining = 3 - currentSum
  const canSubmit = name.trim().length > 0 && background.trim().length > 0 && remaining === 0

  function changeAttr(key: keyof PlayerSheet['attributes'], value: AttributeScore) {
    setAttributes(prev => ({ ...prev, [key]: value }))
    setSuccess(null)
    setError(null)
  }

  function toggleMove(m: string) {
    setSelectedMoves(prev => (prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]))
  }

  async function onSubmit() {
    setError(null)
    setSuccess(null)
    if (!user) {
      setError('not_authenticated')
      return
    }
    if (remaining !== 0) {
      setError('invalid_attributes_sum')
      return
    }
    const payload = {
      name,
      background,
      attributes,
      equipment,
      notes,
      moves: selectedMoves
    }
    if (!existing) {
      const res = createMyPlayerSheet(campaignId, payload)
      if (!res.ok) {
        setError(res.message)
        return
      }
      setSuccess('created')
    } else {
      const res = updateMyPlayerSheet(campaignId, payload)
      if (!res.ok) {
        setError(res.message)
        return
      }
      setSuccess('saved')
    }
  }

  return (
    <div className="card">
      <h2>{t('sheet.title')}</h2>
      <div>
        <label>
          {t('sheet.name')}
          <input value={name} onChange={e => setName(e.target.value)} />
        </label>
      </div>
      <div>
        <label>
          {t('sheet.background')}
          <input value={background} onChange={e => setBackground(e.target.value)} />
        </label>
      </div>
      <div>
        <h3>{t('sheet.attributes.title')}</h3>
        <div>
          <p>{t('sheet.attributes.remaining_sum')}: {remaining}</p>
        </div>
        <div>
          <fieldset>
            <legend>{t('sheet.attributes.forca')}</legend>
            {rangeScores().map(v => (
              <label key={`forca-${v}`}>
                <input type="radio" name="forca" checked={attributes.forca === v} onChange={() => changeAttr('forca', v)} /> {v}
              </label>
            ))}
          </fieldset>
          <fieldset>
            <legend>{t('sheet.attributes.agilidade')}</legend>
            {rangeScores().map(v => (
              <label key={`agilidade-${v}`}>
                <input type="radio" name="agilidade" checked={attributes.agilidade === v} onChange={() => changeAttr('agilidade', v)} /> {v}
              </label>
            ))}
          </fieldset>
          <fieldset>
            <legend>{t('sheet.attributes.sabedoria')}</legend>
            {rangeScores().map(v => (
              <label key={`sabedoria-${v}`}>
                <input type="radio" name="sabedoria" checked={attributes.sabedoria === v} onChange={() => changeAttr('sabedoria', v)} /> {v}
              </label>
            ))}
          </fieldset>
          <fieldset>
            <legend>{t('sheet.attributes.carisma')}</legend>
            {rangeScores().map(v => (
              <label key={`carisma-${v}`}>
                <input type="radio" name="carisma" checked={attributes.carisma === v} onChange={() => changeAttr('carisma', v)} /> {v}
              </label>
            ))}
          </fieldset>
          <fieldset>
            <legend>{t('sheet.attributes.intuicao')}</legend>
            {rangeScores().map(v => (
              <label key={`intuicao-${v}`}>
                <input type="radio" name="intuicao" checked={attributes.intuicao === v} onChange={() => changeAttr('intuicao', v)} /> {v}
              </label>
            ))}
          </fieldset>
        </div>
      </div>
      <div>
        <h3>{t('sheet.moves.title')}</h3>
        <div>
          {movesEnabled.map(m => (
            <label key={m} style={{ display: 'block' }}>
              <input type="checkbox" checked={selectedMoves.includes(m)} onChange={() => toggleMove(m)} /> {m}
            </label>
          ))}
        </div>
      </div>
      <div>
        <label>
          {t('sheet.equipment')}
          <textarea value={equipment} onChange={e => setEquipment(e.target.value)} />
        </label>
      </div>
      <div>
        <label>
          {t('sheet.notes')}
          <textarea value={notes} onChange={e => setNotes(e.target.value)} />
        </label>
      </div>
      {error && <div className="error" role="alert" aria-live="assertive">{t(`error.${error}`)}</div>}
      {success && <div role="status" aria-live="polite">{t(`success.${success}`)}</div>}
      <div>
        <button onClick={onSubmit} disabled={!canSubmit}>{existing ? t('actions.save') : t('sheet.create')}</button>
      </div>
    </div>
  )
}