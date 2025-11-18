import { createBrowserRouter, Navigate } from 'react-router-dom'
import App from '../App'
import { RequireAuth, RequireRole } from '@auth/guards'
import Login from '@auth/Login'
import DashboardMaster from '@shared/pages/DashboardMaster'
import DashboardPlayer from '@shared/pages/DashboardPlayer'
import CampaignRoute from '@campaigns/Route'
import CharacterRoute from '@characters/Route'
import SessionRoute from '@sessions/Route'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { path: '/', element: <Navigate to="/login" replace /> },
      { path: '/login', element: <Login /> },
      {
        element: <RequireAuth />,
        children: [
          {
            path: '/dashboard/master',
            element: (
              <RequireRole role="master">
                <DashboardMaster />
              </RequireRole>
            )
          },
          {
            path: '/dashboard/player',
            element: (
              <RequireRole role="player">
                <DashboardPlayer />
              </RequireRole>
            )
          },
          { path: '/campaigns/:id', element: <CampaignRoute /> },
          { path: '/characters/:id', element: <CharacterRoute /> },
          { path: '/sessions/:id', element: <SessionRoute /> }
        ]
      }
    ]
  }
])