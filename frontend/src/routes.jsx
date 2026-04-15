import React from 'react'
import { createBrowserRouter } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Analytics from './pages/Analytics'
import Routes from './pages/Routes'
import Settings from './pages/Settings'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Dashboard />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: '/analytics',
    element: <Analytics />,
  },
  {
    path: '/routes',
    element: <Routes />,
  },
  {
    path: '/settings',
    element: <Settings />,
  },
])