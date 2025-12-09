import { useState, FormEvent } from 'react'
import { useAppStore } from '@shared/store/appStore'
import { useNavigate } from 'react-router-dom'
import { collection, addDoc } from 'firebase/firestore'
import { getDb } from '@fb/client'

export default function CreateCampaign() {
    const user = useAppStore(s => s.user)
    const navigate = useNavigate()
    const [name, setName] = useState('')
    const [plot, setPlot] = useState('')

    function handleSubmit(e: FormEvent) {
        e.preventDefault()
        if (!name || !plot) return
        const db = getDb()
        if (!db || !user) return
        ;(async () => {
            const docRef = await addDoc(collection(db, 'campaigns'), {
                name,
                plot,
                ownerId: user.uid,
                createdAt: Date.now()
            })
            navigate(`/campaigns/${docRef.id}`)
        })()
    }

    return (
        <div className="create-campaign">
            <h2>Nova Campanha</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Nome da Campanha</label>
                    <input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: A Sombra do Dragão" />
                </div>
                <div className="form-group">
                    <label>Plot Inicial</label>
                    <textarea value={plot} onChange={e => setPlot(e.target.value)} placeholder="Descreva o cenário inicial..." />
                </div>
                <button type="submit">Criar Campanha</button>
            </form>
        </div>
    )
}
