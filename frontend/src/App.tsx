import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { isApiMisconfiguredForProduction } from './config/env'
import HomePage from './pages/HomePage'
import UserLogin from './pages/UserLogin'
import AgencyLogin from './pages/AgencyLogin'
import UserDashboard from './pages/UserDashboard'
import AgencyDashboard from './pages/AgencyDashboard'
import PackageList from './pages/PackageList'

function App() {
  const { user, isAuthenticated } = useAuthStore()

  return (
    <Router>
      {isApiMisconfiguredForProduction() && (
        <div
          role="alert"
          className="border-b border-amber-400 bg-amber-100 px-4 py-3 text-center text-sm text-amber-950"
        >
          <strong className="font-semibold">Backend URL missing or still a documentation example.</strong> Open{' '}
          <strong>Railway</strong> → your backend service → copy the <strong>public HTTPS URL</strong> (it looks like{' '}
          <code className="rounded bg-amber-200/80 px-1">https://something-real.up.railway.app</code>
          ). In <strong>Vercel</strong> → Settings → Environment Variables set{' '}
          <code className="rounded bg-amber-200/80 px-1">VITE_API_URL</code> to that URL (with or without{' '}
          <code className="rounded bg-amber-200/80 px-1">/api</code>),{' '}
          <code className="rounded bg-amber-200/80 px-1">VITE_WS_URL</code> to{' '}
          <code className="rounded bg-amber-200/80 px-1">wss://</code> + same host, then <strong>Redeploy</strong>. Do not
          use words like &quot;your-service&quot; or &quot;your-app&quot; — those are placeholders, not real hosts.
        </div>
      )}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login/user" element={<UserLogin />} />
        <Route path="/login/agency" element={<AgencyLogin />} />
        <Route
          path="/dashboard/user"
          element={
            isAuthenticated && user?.role === 'TOURIST' ? (
              <UserDashboard />
            ) : (
              <Navigate to="/login/user" replace />
            )
          }
        />
        <Route
          path="/dashboard/agency"
          element={
            isAuthenticated && user?.role === 'AGENCY' ? (
              <AgencyDashboard />
            ) : (
              <Navigate to="/login/agency" replace />
            )
          }
        />
        <Route path="/packages" element={<PackageList />} />
      </Routes>
    </Router>
  )
}

export default App
