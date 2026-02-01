import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
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
