import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import NotificationBell from '../components/notifications/NotificationBell'
import { packageApi, bookingApi } from '../services/api'
import { motion, AnimatePresence } from 'framer-motion'
import PackageList from './PackageList'
import PackageForm from '../components/packages/PackageForm'
import type { Package } from '../types'

export default function AgencyDashboard() {
  const location = useLocation()
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState<'my-packages' | 'browse-all' | 'bookings' | 'stats'>('my-packages')
  const [myPackages, setMyPackages] = useState<any[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({
    totalPackages: 0,
    totalBookings: 0,
    totalRevenue: 0,
    activePackages: 0,
  })
  const [showPackageForm, setShowPackageForm] = useState(false)
  const [editingPackage, setEditingPackage] = useState<Package | null>(null)

  useEffect(() => {
    // Check if navigation state has activeTab
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab)
    }
  }, [location.state])

  useEffect(() => {
    if (activeTab === 'my-packages') {
      loadMyPackages()
    } else if (activeTab === 'bookings') {
      loadBookings()
    } else if (activeTab === 'stats') {
      loadStats()
    }
  }, [activeTab])

  const loadMyPackages = async () => {
    try {
      setLoading(true)
      const response = await packageApi.getMyPackages()
      if (response.success && response.data) {
        setMyPackages(response.data)
      }
    } catch (error) {
      console.error('Failed to load packages:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadBookings = async () => {
    try {
      setLoading(true)
      const response = await bookingApi.getAgencyBookings()
      if (response.success && response.data) {
        setBookings(response.data)
      }
    } catch (error) {
      console.error('Failed to load bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      setLoading(true)
      const packagesResponse = await packageApi.getMyPackages()
      const bookingsResponse = await bookingApi.getAgencyBookings()
      
      if (packagesResponse.success && packagesResponse.data) {
        const packages = packagesResponse.data
        setStats({
          totalPackages: packages.length,
          activePackages: packages.filter((p: any) => p.isActive).length,
          totalBookings: bookingsResponse.success && bookingsResponse.data ? bookingsResponse.data.length : 0,
          totalRevenue: bookingsResponse.success && bookingsResponse.data
            ? bookingsResponse.data.reduce((sum: number, b: any) => sum + Number(b.totalAmount || 0), 0)
            : 0,
        })
      }
    } catch (error) {
      console.error('Failed to load stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'my-packages', label: 'My Packages' },
    { id: 'browse-all', label: 'Browse All' },
    { id: 'bookings', label: 'Bookings' },
    { id: 'stats', label: 'Statistics' },
  ]

  return (
    <div className="min-h-screen bg-[#FFFAC3]/30 flex flex-col">
      <Navbar />

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-lg mb-6 overflow-hidden">
          <div className="flex flex-wrap border-b border-gray-200">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`relative px-6 py-4 text-sm font-bold transition-all ${
                  activeTab === tab.id
                    ? 'text-[#566614] bg-[#FFFAC3]/30'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
                style={{ fontFamily: 'LEMON MILK, sans-serif' }}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#566614] to-[#6E6B40]"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'my-packages' && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold" style={{ fontFamily: 'LEMON MILK, sans-serif' }}>
                    My Packages
                  </h2>
                  <motion.button
                    onClick={() => {
                      setEditingPackage(null)
                      setShowPackageForm(true)
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-r from-[#566614] to-[#6E6B40] text-white px-6 py-3 rounded-xl hover:shadow-xl transition-all font-bold flex items-center space-x-2 shadow-lg"
                    style={{ fontFamily: 'LEMON MILK, sans-serif' }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Create New Package</span>
                  </motion.button>
                </div>

                {loading ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#566614]"></div>
                    <p className="mt-4 text-gray-600">Loading packages...</p>
                  </div>
                ) : myPackages.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-600 mb-4">You haven't created any packages yet.</p>
                    <motion.button
                      onClick={() => {
                        setEditingPackage(null)
                        setShowPackageForm(true)
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-gradient-to-r from-[#566614] to-[#6E6B40] text-white px-8 py-3 rounded-xl hover:shadow-xl transition-all font-bold shadow-lg"
                      style={{ fontFamily: 'LEMON MILK, sans-serif' }}
                    >
                      Create Your First Package
                    </motion.button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myPackages.map((pkg: any) => (
                      <div
                        key={pkg.id}
                        className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                      >
                        {pkg.images && pkg.images.length > 0 && (
                          <img
                            src={pkg.images[0]}
                            alt={pkg.title}
                            className="w-full h-48 object-cover"
                          />
                        )}
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-lg">{pkg.title}</h3>
                            <span
                              className={`px-2 py-1 text-xs rounded ${
                                pkg.isActive
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {pkg.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm mb-2">{pkg.destination}</p>
                          <p className="text-xl font-bold text-[#566614] mb-4">
                            PKR {Number(pkg.price).toLocaleString()}
                          </p>
                          <div className="flex space-x-2">
                            <motion.button
                              onClick={() => {
                                setEditingPackage(pkg)
                                setShowPackageForm(true)
                              }}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="flex-1 bg-gradient-to-r from-[#566614] to-[#6E6B40] text-white py-2.5 rounded-lg hover:shadow-lg transition-all text-sm font-semibold"
                            >
                              <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Edit
                            </motion.button>
                            <motion.button
                              onClick={async () => {
                                if (confirm('Are you sure you want to delete this package? This action cannot be undone.')) {
                                  try {
                                    const response = await packageApi.delete(pkg.id)
                                    if (response.success) {
                                      await loadMyPackages()
                                    } else {
                                      alert(response.error?.message || 'Failed to delete package')
                                    }
                                  } catch (error: any) {
                                    console.error('Delete error:', error)
                                    alert(error.response?.data?.error?.message || 'Failed to delete package')
                                  }
                                }
                              }}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white py-2.5 rounded-lg hover:shadow-lg transition-all text-sm font-semibold"
                            >
                              <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Delete
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'browse-all' && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: 'LEMON MILK, sans-serif' }}>
                  Browse All Packages
                </h2>
                <PackageList />
              </div>
            )}

            {activeTab === 'bookings' && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: 'LEMON MILK, sans-serif' }}>
                  Bookings
                </h2>

                {loading ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#566614]"></div>
                    <p className="mt-4 text-gray-600">Loading bookings...</p>
                  </div>
                ) : bookings.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-600">No bookings yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking: any) => (
                      <div
                        key={booking.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-lg">{booking.package?.title || 'Package'}</h3>
                            <p className="text-gray-600 text-sm">
                              {booking.travelers} traveler(s) • PKR {Number(booking.totalAmount).toLocaleString()}
                            </p>
                            <p className="text-gray-500 text-xs mt-1">
                              Booking Date: {new Date(booking.bookingDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                booking.status === 'CONFIRMED'
                                  ? 'bg-green-100 text-green-800'
                                  : booking.status === 'PENDING'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : booking.status === 'CANCELLED'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {booking.status}
                            </span>
                            {booking.status === 'PENDING' && (
                              <div className="mt-3 flex space-x-2">
                                <motion.button
                                  onClick={async () => {
                                    try {
                                      const response = await bookingApi.confirm(booking.id)
                                      if (response.success) {
                                        await loadBookings()
                                        alert('✅ Booking accepted successfully!')
                                      } else {
                                        alert(response.error?.message || 'Failed to accept booking')
                                      }
                                    } catch (error: any) {
                                      console.error('Accept booking error:', error)
                                      alert(error.response?.data?.error?.message || 'Failed to accept booking')
                                    }
                                  }}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  className="bg-gradient-to-r from-green-600 to-green-700 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:shadow-lg transition-all flex items-center space-x-1"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  <span>Accept</span>
                                </motion.button>
                                <motion.button
                                  onClick={async () => {
                                    if (confirm('Are you sure you want to reject this booking?')) {
                                      try {
                                        const response = await bookingApi.cancel(booking.id)
                                        if (response.success) {
                                          await loadBookings()
                                          alert('❌ Booking rejected')
                                        } else {
                                          alert(response.error?.message || 'Failed to reject booking')
                                        }
                                      } catch (error: any) {
                                        console.error('Reject booking error:', error)
                                        alert(error.response?.data?.error?.message || 'Failed to reject booking')
                                      }
                                    }
                                  }}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  className="bg-gradient-to-r from-red-600 to-red-700 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:shadow-lg transition-all flex items-center space-x-1"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                  <span>Reject</span>
                                </motion.button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'stats' && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: 'LEMON MILK, sans-serif' }}>
                  Statistics
                </h2>

                {loading ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#566614]"></div>
                    <p className="mt-4 text-gray-600">Loading statistics...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-[#FFFAC3]/50 rounded-lg p-6 border border-[#566614]/20">
                      <p className="text-gray-600 text-sm mb-2">Total Packages</p>
                      <p className="text-3xl font-bold text-[#566614]">{stats.totalPackages}</p>
                    </div>
                    <div className="bg-[#FFFAC3]/50 rounded-lg p-6 border border-[#566614]/20">
                      <p className="text-gray-600 text-sm mb-2">Active Packages</p>
                      <p className="text-3xl font-bold text-[#566614]">{stats.activePackages}</p>
                    </div>
                    <div className="bg-[#FFFAC3]/50 rounded-lg p-6 border border-[#566614]/20">
                      <p className="text-gray-600 text-sm mb-2">Total Bookings</p>
                      <p className="text-3xl font-bold text-[#566614]">{stats.totalBookings}</p>
                    </div>
                    <div className="bg-[#FFFAC3]/50 rounded-lg p-6 border border-[#566614]/20">
                      <p className="text-gray-600 text-sm mb-2">Total Revenue</p>
                      <p className="text-3xl font-bold text-[#566614]">
                        PKR {stats.totalRevenue.toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Package Form Modal */}
      {showPackageForm && (
        <PackageForm
          packageData={editingPackage}
          onClose={() => {
            setShowPackageForm(false)
            setEditingPackage(null)
          }}
          onSuccess={() => {
            loadMyPackages()
            if (activeTab === 'stats') {
              loadStats()
            }
          }}
        />
      )}

      <Footer />
    </div>
  )
}
