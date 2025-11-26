import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import Login from './auth/Login'
import ProtectedRoute from './routes/ProtectedRoute'
import LandingPage from './routes/LandingPage'
import Dashboard from './routes/Dashboard'
import CampaignDetail from './campaigns/CampaignDetail'
import InviteAcceptPage from './campaigns/InviteAcceptPage'
import DebugCampaigns from './debug/DebugCampaigns'
import CharacterSheet from './characters/CharacterSheet'
import SessionView from './sessions/SessionView'
import NpcEdit from './npc/NpcEdit'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename="/pbta.app">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/home" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard/*" element={<Dashboard />} />
            <Route path="/campaigns/:id" element={<CampaignDetail />} />
            <Route path="/invite" element={<InviteAcceptPage />} />
            <Route path="/campaigns/:id/sheet" element={<CharacterSheet />} />
            <Route path="/campaigns/:id/session/:sessionId" element={<SessionView />} />
            <Route path="/campaigns/:id/npcs/:npcId" element={<NpcEdit />} />
            <Route path="/debug" element={<DebugCampaigns />} />
            {/* Add more protected routes here */}
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
