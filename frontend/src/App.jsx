import React, { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import Loader from './components/Common/Loader'
import { NotificationProvider } from './context/NotificationContext'
import { AuthProvider } from './context/AuthContext'
import PrivateRoute from './components/Common/PrivateRoute'

// Lazy load pages
const DashboardPage = lazy(() => import('./pages/Dashboard'))
const AnalyticsPage = lazy(() => import('./pages/Analytics'))
const RoutesPage = lazy(() => import('./pages/Routes'))
const SettingsPage = lazy(() => import('./pages/Settings'))
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'))
const LoginPage = lazy(() => import('./pages/Login'))
const RegisterPage = lazy(() => import('./pages/Register'))
const ProfilePage = lazy(() => import('./pages/Profile'))

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Layout>
          <Suspense fallback={<Loader />}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
              <Route path="/analytics" element={<PrivateRoute><AnalyticsPage /></PrivateRoute>} />
              <Route path="/routes" element={<PrivateRoute><RoutesPage /></PrivateRoute>} />
              <Route path="/settings" element={<PrivateRoute><SettingsPage /></PrivateRoute>} />
              <Route path="/notifications" element={<PrivateRoute><NotificationsPage /></PrivateRoute>} />
              <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
            </Routes>
          </Suspense>
        </Layout>
      </NotificationProvider>
    </AuthProvider>
  )
}

export default App
