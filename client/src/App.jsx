import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import useAuthStore from './store/authStore'

import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import CreatePollPage from './pages/CreatePollPage'
import PublicPollPage from './pages/PublicPollPage'
import AnalyticsPage from './pages/AnalyticsPage'
import ProtectedRoute from './components/layout/ProtectedRoute'

export default function App() {
  const fetchMe = useAuthStore((s) => s.fetchMe)

  useEffect(() => {
    fetchMe()
  }, [])

  return (
    <BrowserRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            fontFamily: '"DM Sans", sans-serif',
            fontSize: '13px',
            background: '#1A1814',
            color: '#F5F2ED',
            borderRadius: '8px',
            padding: '10px 16px',
          },
          success: {
            iconTheme: { primary: '#C4621A', secondary: '#F5F2ED' },
          },
        }}
      />

      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Public poll slug — accessible to all */}
        <Route path="/p/:publicLink" element={<PublicPollPage />} />

        {/* Protected */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/polls/new"
          element={
            <ProtectedRoute>
              <CreatePollPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/polls/:pollId/analytics"
          element={
            <ProtectedRoute>
              <AnalyticsPage />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}