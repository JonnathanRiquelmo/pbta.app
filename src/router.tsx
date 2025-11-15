import { createHashRouter, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Offline from './pages/Offline'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Roller from './pages/Roller'
import PageStub from './pages/PageStub'
import SheetList from './components/sheets/SheetList'
import SheetForm from './components/sheets/SheetForm'
import SheetEditor from './components/sheets/SheetEditor'
import CampaignDetail from './components/campaigns/CampaignDetail'
import PlotEditor from './components/campaigns/PlotEditor'
import CampaignList from './components/campaigns/CampaignList'
import CampaignForm from './components/campaigns/CampaignForm'
import AuthGuard from './components/auth/AuthGuard'
import ModeGuard from './components/auth/ModeGuard'

const bypass = (import.meta.env.VITE_TEST_BYPASS_AUTH === 'true')

const baseRoutes = [
  { path: '/', element: <Home /> },
  { path: '/login', element: <Login /> },
  { path: '/offline', element: <Offline /> },
  { path: '/public/character/:publicShareId', element: <PageStub title="Public Character" /> },
  { path: '/public/npc/:publicShareId', element: <PageStub title="Public NPC" /> }
]

const authedChildren = [
  { path: '/dashboard', element: <Dashboard /> },
  { path: '/profile', element: <Profile /> },
  { path: '/roller', element: <Roller /> },
  { path: '/sheets', element: <SheetList /> },
  { path: '/sheets/new', element: <SheetForm /> },
  { path: '/sheets/:id', element: <SheetEditor /> },
  { path: '/sheets/:id/view', element: <PageStub title="Sheet View" /> },
  { path: '/campaigns', element: <PageStub title="Campaigns" /> },
  { path: '/campaigns/:id', element: <CampaignDetail /> },
  { path: '/campaigns/:id/moves', element: <PageStub title="Campaign Moves" /> },
  { path: '/campaigns/:id/sessions', element: <PageStub title="Campaign Sessions" /> },
  { path: '/campaigns/:id/sessions/:sessionId', element: <PageStub title="Session Viewer" /> },
  { path: '/notes', element: <PageStub title="Notes" /> },
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
      { path: 'pdms', element: <PageStub title="PDMs" /> },
      { path: 'pdms/new', element: <PageStub title="New PDM" /> },
      { path: 'pdms/:id', element: <PageStub title="PDM Editor" /> },
      { path: 'campaigns/:id/moves', element: <PageStub title="Master Moves" /> },
      { path: 'campaigns/:id/sessions', element: <PageStub title="Manage Sessions" /> },
      { path: 'campaigns/:id/sessions/new', element: <PageStub title="New Session" /> },
      { path: 'campaigns/:id/sessions/:sessionId', element: <PageStub title="Session Editor" /> },
      { path: 'rolls', element: <PageStub title="Rolls Monitor" /> },
      { path: 'invites', element: <PageStub title="Invites" /> },
      { path: 'settings', element: <PageStub title="Master Settings" /> }
    ]
  }
]

export const router = createHashRouter([
  ...baseRoutes,
  ...(bypass ? authedChildren : [{ element: <AuthGuard />, children: authedChildren }]),
  { path: '*', element: <Navigate to="/" replace /> }
])