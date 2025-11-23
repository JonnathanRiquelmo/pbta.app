import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@shared/store/appStore'
import { useEffect } from 'react'
import { motion } from 'framer-motion'

export default function LandingPage() {
    const navigate = useNavigate()
    const user = useAppStore(s => s.user)

    useEffect(() => {
        if (user) {
            navigate(user.role === 'master' ? '/dashboard/master' : '/dashboard/player')
        }
    }, [user, navigate])

    return (
        <motion.div
            className="landing-page container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <header className="hero text-center" style={{ padding: '4rem 0' }}>
                <motion.h1
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    PBTA RPG System
                </motion.h1>
                <motion.p
                    style={{ fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto 2rem' }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    Uma plataforma imersiva para suas campanhas de RPG Powered by the Apocalypse.
                </motion.p>
                <motion.button
                    onClick={() => navigate('/login')}
                    className="btn btn-primary"
                    style={{ fontSize: '1.1rem', padding: '12px 32px' }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    Acessar Sistema
                </motion.button>
            </header>

            <section className="features" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '4rem' }}>
                <motion.div
                    className="feature card"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    <h2 className="text-accent">Para Mestres</h2>
                    <p>Gerencie campanhas, crie NPCs, controle sessões e rolagens com facilidade.</p>
                </motion.div>
                <motion.div
                    className="feature card"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 }}
                >
                    <h2 className="text-accent">Para Jogadores</h2>
                    <p>Fichas interativas, rolagens automatizadas e acesso ao plot da campanha.</p>
                </motion.div>
            </section>
        </motion.div>
    )
}
