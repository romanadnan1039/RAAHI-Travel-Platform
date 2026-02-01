import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import NotificationBell from '../notifications/NotificationBell'

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
    setUserMenuOpen(false)
  }

  const isActive = (path: string) => location.pathname === path

  return (
    <nav className="bg-[#41491D] text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 hover:opacity-90 transition-opacity">
            <div className="text-2xl font-bold" style={{ fontFamily: 'LEMON MILK, sans-serif' }}>
              RAAHI
            </div>
            <div className="text-xs uppercase tracking-wider opacity-80 hidden sm:block">
              TRAVEL | EXPLORE | DISCOVER
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {isAuthenticated ? (
              <>
                {user?.role === 'TOURIST' ? (
                  <>
                    <Link
                      to="/dashboard/user"
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive('/dashboard/user')
                          ? 'bg-[#566614] text-[#FFFAC3]'
                          : 'hover:bg-[#566614]/50'
                      }`}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/packages"
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive('/packages')
                          ? 'bg-[#566614] text-[#FFFAC3]'
                          : 'hover:bg-[#566614]/50'
                      }`}
                    >
                      Browse Packages
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/dashboard/agency"
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive('/dashboard/agency')
                          ? 'bg-[#566614] text-[#FFFAC3]'
                          : 'hover:bg-[#566614]/50'
                      }`}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/packages"
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive('/packages')
                          ? 'bg-[#566614] text-[#FFFAC3]'
                          : 'hover:bg-[#566614]/50'
                      }`}
                    >
                      Browse All
                    </Link>
                  </>
                )}
                {user?.role === 'AGENCY' && <NotificationBell />}
                
                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-[#566614]/50 transition-colors"
                  >
                    <span className="text-sm">{user?.name}</span>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                      <div className="px-4 py-2 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/packages"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-[#566614]/50 transition-colors"
                >
                  Browse Packages
                </Link>
                <Link
                  to="/login/user"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-[#566614]/50 transition-colors"
                >
                  User Login
                </Link>
                <Link
                  to="/login/agency"
                  className="px-4 py-2 rounded-md text-sm font-medium bg-[#566614] hover:bg-[#6E6B40] transition-colors"
                >
                  Agency Login
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-md hover:bg-[#566614]/50 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-[#566614]/30">
            {isAuthenticated ? (
              <div className="space-y-2">
                {user?.role === 'TOURIST' ? (
                  <>
                    <Link
                      to="/dashboard/user"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`block px-3 py-2 rounded-md text-sm ${
                        isActive('/dashboard/user') ? 'bg-[#566614] text-[#FFFAC3]' : ''
                      }`}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/packages"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`block px-3 py-2 rounded-md text-sm ${
                        isActive('/packages') ? 'bg-[#566614] text-[#FFFAC3]' : ''
                      }`}
                    >
                      Browse Packages
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/dashboard/agency"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`block px-3 py-2 rounded-md text-sm ${
                        isActive('/dashboard/agency') ? 'bg-[#566614] text-[#FFFAC3]' : ''
                      }`}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/packages"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`block px-3 py-2 rounded-md text-sm ${
                        isActive('/packages') ? 'bg-[#566614] text-[#FFFAC3]' : ''
                      }`}
                    >
                      Browse All
                    </Link>
                  </>
                )}
                <div className="px-3 py-2 text-sm border-t border-[#566614]/30 mt-2">
                  <p className="font-medium">{user?.name}</p>
                  <p className="text-xs opacity-80">{user?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 rounded-md text-sm text-red-300 hover:bg-[#566614]/50"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Link
                  to="/packages"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-sm hover:bg-[#566614]/50"
                >
                  Browse Packages
                </Link>
                <Link
                  to="/login/user"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-sm hover:bg-[#566614]/50"
                >
                  User Login
                </Link>
                <Link
                  to="/login/agency"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-sm bg-[#566614] hover:bg-[#6E6B40]"
                >
                  Agency Login
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Close dropdown when clicking outside */}
      {userMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setUserMenuOpen(false)}
        />
      )}
    </nav>
  )
}
