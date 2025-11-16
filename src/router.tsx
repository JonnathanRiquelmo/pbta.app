import { createHashRouter, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Offline from './pages/Offline'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Roller from './pages/Roller'
import PageStub from './pages/PageStub'
import Notes from './pages/Notes'
import SheetList from './components/sheets/SheetList'
import SheetForm from './components/sheets/SheetForm'
import SheetEditor from './components/sheets/SheetEditor'
import SheetPublicView from './components/sheets/SheetPublicView'
import PdmList from './components/pdms/PdmList'
import PdmForm from './components/pdms/PdmForm'
import PdmEditor from './components/pdms/PdmEditor'
import PdmPublicView from './components/public/PdmPublicView'
import CampaignDetail from './components/campaigns/CampaignDetail'
import PlotEditor from './components/campaigns/PlotEditor'
import CampaignList from './components/campaigns/CampaignList'
import CampaignForm from './components/campaigns/CampaignForm'
import CampaignMoves from './components/moves/CampaignMoves'
import MasterMoves from './components/moves/MasterMoves'
import AuthGuard from './components/auth/AuthGuard'
import ModeGuard from './components/auth/ModeGuard'
import AppLayout from './components/layout/AppLayout'
import PublicCharacterView from './components/public/PublicCharacterView'
import SessionList from './components/sessions/SessionList'
import SessionEditor from './components/sessions/SessionEditor'
import SessionViewer from './components/sessions/SessionViewer'
import RollMonitor from './components/roller/RollMonitor'

const bypass = (import.meta.env.VITE_TEST_BYPASS_AUTH === 'true')

const baseRoutes = [
  { path: '/', element: <Home /> },
  { path: '/login', element: <Login /> },
  { path: '/offline', element: <Offline /> }
]

const authedChildren = [
  { path: '/dashboard', element: <Dashboard /> },
  { path: '/profile', element: <Profile /> },
  { path: '/roller', element: <Roller /> },
  { path: '/sheets', element: <SheetList /> },
  { path: '/sheets/new', element: <SheetForm /> },
  { path: '/sheets/:id', element: <SheetEditor /> },
  { path: '/sheets/:id/view', element: <SheetPublicView /> },
  { path: '/campaigns', element: <PageStub title="Campaigns" /> },
  { path: '/campaigns/:id', element: <CampaignDetail /> },
  { path: '/campaigns/:id/moves', element: <CampaignMoves /> },
  { path: '/campaigns/:id/sessions', element: <PageStub title="Campaign Sessions" /> },
  { path: '/campaigns/:id/sessions/:sessionId', element: <SessionViewer /> },
  { path: '/notes', element: <Notes /> },
  {
    path: '/master',
    element: <ModeGuard />,
    children: [
      { path: '', element: <PageStub title="Master Home" /> },
      { path: 'campaigns', element: <CampaignList /> },
      { path: 'campaigns/new', element: <CampaignForm /> },
      { path: 'campaigns/:id', element: <CampaignDetail /> },
      { path: 'campaigns/:id/plot', element: <PlotEditor /> },
      { path: 'campaigns/:id/characters', element: <PageStub title="Campaign Characters" /> },
      { path: 'pdms', element: <PdmList /> },
      { path: 'pdms/new', element: <PdmForm /> },
      { path: 'pdms/:id', element: <PdmEditor /> },
      { path: 'campaigns/:id/moves', element: <MasterMoves /> },
      { path: 'campaigns/:id/sessions', element: <SessionList /> },
      { path: 'campaigns/:id/sessions/new', element: <SessionEditor /> },
      { path: 'campaigns/:id/sessions/:sessionId', element: <SessionEditor /> },
      { path: 'rolls', element: <RollMonitor /> },
      { path: 'invites', element: <PageStub title="Invites" /> },
      { path: 'settings', element: <PageStub title="Master Settings" /> }
    ]
  }
]

export const router = createHashRouter([
  ...baseRoutes,
  { element: <AppLayout />, children: [
    { path: '/public/character/:publicShareId', element: <PublicCharacterView /> },
    { path: '/public/npc/:publicShareId', element: <PdmPublicView /> }
  ]},
  ...(bypass
    ? [{ element: <AppLayout />, children: authedChildren }]
    : [{ element: <AuthGuard />, children: [{ element: <AppLayout />, children: authedChildren }] }]
  ),
  { path: '*', element: <Navigate to="/" replace /> }
])