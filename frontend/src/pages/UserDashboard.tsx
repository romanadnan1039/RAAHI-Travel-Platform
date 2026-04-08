import { useState, useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import AIChat from '../components/chat/AIChat'
import TravelerAiAvatar from '../components/chat/TravelerAiAvatar'
import PackageGrid from '../components/packages/PackageGrid'
import BookingModal from '../components/packages/BookingModal'
import FilterSidebar from '../components/packages/FilterSidebar'
import { packageApi, bookingApi } from '../services/api'
import { motion, AnimatePresence } from 'framer-motion'
import type { Package, Booking } from '../types'

interface FilterState {
  destination: string
  minPrice: string
  maxPrice: string
  duration: string
  minRating: string
  sortBy: string
  travelType: string
}

export default function UserDashboard() {
  const { user: _user } = useAuthStore()
  /** Floating chat widget (Intercom-style) */
  const [chatOpen, setChatOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'packages' | 'bookings'>('packages')
  const [packages, setPackages] = useState<Package[]>([])
  const [filteredPackages, setFilteredPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<FilterState>({
    destination: '',
    minPrice: '',
    maxPrice: '',
    duration: '',
    minRating: '',
    sortBy: 'relevance',
    travelType: '',
  })
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loadingBookings, setLoadingBookings] = useState(false)

  useEffect(() => {
    loadPackages()
    if (activeTab === 'bookings') {
      loadBookings()
    }
  }, [])

  useEffect(() => {
    // Only apply filters if packages are loaded
    if (packages.length > 0 || !loading) {
      applyFilters()
    }
  }, [packages, filters, loading])

  useEffect(() => {
    if (activeTab === 'bookings') {
      loadBookings()
    }
  }, [activeTab])

  useEffect(() => {
    if (!chatOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setChatOpen(false)
    }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [chatOpen])

  const loadPackages = async () => {
    try {
      setLoading(true)
      const response = await packageApi.getAll()
      console.log('Packages API response:', response)
      
      if (response.success && response.data) {
        // Handle different response structures
        let allPackages: Package[] = []
        const responseData = response.data as any
        
        if (Array.isArray(response.data)) {
          // Direct array response
          allPackages = response.data
        } else if (responseData.packages && Array.isArray(responseData.packages)) {
          // Nested packages array
          allPackages = responseData.packages
        } else if (responseData.data && Array.isArray(responseData.data)) {
          // Double nested
          allPackages = responseData.data
        }
        
        console.log('Loaded packages:', allPackages.length)
        setPackages(allPackages)
        setFilteredPackages(allPackages)
      } else {
        console.error('Failed to load packages:', response.error)
        setPackages([])
        setFilteredPackages([])
      }
    } catch (error) {
      console.error('Failed to load packages:', error)
      setPackages([])
      setFilteredPackages([])
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    console.log('Applying filters:', filters)
    
    // Check if any filter is actually set (not empty or whitespace)
    const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
      if (key === 'sortBy') return false // sortBy is not a filter
      return value && value.toString().trim() !== ''
    })

    if (!hasActiveFilters) {
      console.log('No active filters, showing all packages')
      setFilteredPackages(packages)
      return
    }

    let filtered = [...packages]

    // Destination filter
    if (filters.destination && filters.destination.trim() !== '') {
      const dest = filters.destination.toLowerCase().trim()
      console.log('Filtering by destination:', dest)
      filtered = filtered.filter(pkg => 
        pkg.destination.toLowerCase().includes(dest)
      )
    }

    // Price filters
    if (filters.minPrice && filters.minPrice.trim() !== '') {
      const minPrice = Number(filters.minPrice)
      if (!isNaN(minPrice)) {
        console.log('Filtering by min price:', minPrice)
        filtered = filtered.filter(pkg => Number(pkg.price) >= minPrice)
      }
    }

    if (filters.maxPrice && filters.maxPrice.trim() !== '') {
      const maxPrice = Number(filters.maxPrice)
      if (!isNaN(maxPrice)) {
        console.log('Filtering by max price:', maxPrice)
        filtered = filtered.filter(pkg => Number(pkg.price) <= maxPrice)
      }
    }

    // Duration filter
    if (filters.duration && filters.duration.trim() !== '') {
      const duration = filters.duration.trim()
      console.log('Filtering by duration:', duration)
      
      if (duration.includes('-')) {
        // Range like "1-2", "3-4", "5-7"
        const [minStr, maxStr] = duration.split('-')
        const min = Number(minStr)
        const max = Number(maxStr)
        
        if (!isNaN(min) && !isNaN(max)) {
          filtered = filtered.filter(pkg => pkg.duration >= min && pkg.duration <= max)
        }
      } else if (duration.includes('+')) {
        // "8+" means 8 or more
        const min = Number(duration.replace('+', ''))
        if (!isNaN(min)) {
          filtered = filtered.filter(pkg => pkg.duration >= min)
        }
      } else {
        // Exact match
        const exactDuration = Number(duration)
        if (!isNaN(exactDuration)) {
          filtered = filtered.filter(pkg => pkg.duration === exactDuration)
        }
      }
    }

    // Rating filter
    if (filters.minRating && filters.minRating.trim() !== '') {
      const minRating = Number(filters.minRating)
      if (!isNaN(minRating)) {
        console.log('Filtering by min rating:', minRating)
        filtered = filtered.filter(pkg => (pkg.rating || 0) >= minRating)
      }
    }

    // Travel Type filter
    if (filters.travelType && filters.travelType.trim() !== '') {
      const travelType = filters.travelType.toLowerCase()
      console.log('Filtering by travel type:', travelType)
      filtered = filtered.filter(pkg => {
        const title = pkg.title.toLowerCase()
        if (travelType === 'budget') return title.includes('budget') || title.includes('economy')
        if (travelType === 'family') return title.includes('family')
        if (travelType === 'adventure') return title.includes('adventure') || title.includes('trekking')
        if (travelType === 'luxury') return title.includes('luxury') || title.includes('premium')
        if (travelType === 'weekend') return title.includes('weekend')
        return true
      })
    }

    // Sorting
    if (filters.sortBy && filters.sortBy !== 'relevance') {
      console.log('Sorting by:', filters.sortBy)
      switch (filters.sortBy) {
        case 'price-low':
          filtered.sort((a, b) => Number(a.price) - Number(b.price))
          break
        case 'price-high':
          filtered.sort((a, b) => Number(b.price) - Number(a.price))
          break
        case 'rating':
          filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0))
          break
        case 'duration':
          filtered.sort((a, b) => a.duration - b.duration)
          break
      }
    }

    console.log('Filtered packages:', filtered.length)
    setFilteredPackages(filtered)
  }

  const handleFilterChange = (newFilters: FilterState) => {
    console.log('Filter changed:', newFilters)
    setFilters(newFilters)
  }

  const handleResetFilters = () => {
    console.log('Resetting filters')
    setFilters({
      destination: '',
      minPrice: '',
      maxPrice: '',
      duration: '',
      minRating: '',
      sortBy: 'relevance',
      travelType: '',
    })
  }

  const handlePackageFilter = (criteria: { destination?: string; duration?: number; budget?: number }) => {
    console.log('Package filter from AI:', criteria)
    const newFilters = { ...filters }
    
    if (criteria.destination) {
      newFilters.destination = criteria.destination
    }
    if (criteria.duration) {
      newFilters.duration = criteria.duration.toString()
    }
    if (criteria.budget) {
      newFilters.maxPrice = criteria.budget.toString()
    }
    
    setFilters(newFilters)
    setActiveTab('packages')
    setChatOpen(false)
  }

  const loadBookings = async () => {
    try {
      setLoadingBookings(true)
      const response = await bookingApi.getUserBookings()
      if (response.success && response.data) {
        setBookings(response.data)
      }
    } catch (error) {
      console.error('Failed to load bookings:', error)
    } finally {
      setLoadingBookings(false)
    }
  }

  return (
    <div className="relative isolate min-h-screen bg-gradient-to-br from-[#FFFAC3]/20 via-white to-[#566614]/5 flex flex-col">
      <Navbar />

      <div className="flex-1 container mx-auto px-3 py-4 sm:px-4 md:py-6">
        {/* Main Container - Premium Card Layout */}
        <div className="flex flex-col gap-4 md:gap-6 h-full min-h-0 lg:flex-row">
          {/* Filters + main content — full width; AI opens from floating button */}
          <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 md:gap-6 lg:flex-row">
          {/* MIDDLE: Filters Card - Premium White Card (Only show when browsing packages) */}
          {activeTab === 'packages' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="w-full min-h-0 flex-shrink-0 lg:w-[320px]"
            >
              <div className="max-h-[min(85dvh,720px)] min-h-[240px] overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-gray-900/5 transition-shadow duration-300 hover:shadow-2xl lg:h-[calc(100vh-150px)] lg:max-h-none">
                <FilterSidebar
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  onReset={handleResetFilters}
                  packageCount={filteredPackages.length}
                />
              </div>
            </motion.div>
          )}

          {/* RIGHT: Main Content Card - Premium White Card with Gradient Header */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="flex min-h-0 min-w-0 flex-1 flex-col"
          >
            <div className="flex max-h-[min(90dvh,800px)] min-h-[min(50vh,420px)] flex-col overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-gray-900/5 transition-shadow duration-300 hover:shadow-2xl lg:h-[calc(100vh-150px)] lg:max-h-none">
              <div className="h-full flex flex-col">
              {/* Premium Header with Gradient Tabs */}
              <div className="flex-shrink-0 border-b border-gray-200/50 bg-gradient-to-r from-[#566614]/5 to-[#6E6B40]/5 px-4 py-4 sm:px-6 sm:py-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center space-x-3">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#566614] to-[#6E6B40] shadow-lg sm:h-10 sm:w-10">
                      <svg className="h-5 w-5 text-white sm:h-6 sm:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h1 className="truncate text-lg font-bold bg-gradient-to-r from-[#566614] to-[#6E6B40] bg-clip-text text-transparent sm:text-2xl" style={{ fontFamily: 'LEMON MILK, sans-serif' }}>
                      {activeTab === 'packages' ? 'Browse Packages' : 'My Bookings'}
                    </h1>
                  </div>
                  <div className="flex w-full flex-shrink-0 gap-2 sm:w-auto sm:justify-end sm:space-x-3">
                    <motion.button
                      type="button"
                      onClick={() => setActiveTab('packages')}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className={`flex flex-1 touch-manipulation items-center justify-center space-x-2 rounded-xl px-4 py-2.5 text-sm font-bold shadow-md transition-all sm:flex-initial sm:px-6 sm:py-3 ${
                        activeTab === 'packages'
                          ? 'bg-gradient-to-r from-[#566614] to-[#6E6B40] text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      style={{ fontFamily: 'LEMON MILK, sans-serif', fontSize: '11px' }}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <span>BROWSE</span>
                    </motion.button>
                    <motion.button
                      type="button"
                      onClick={() => setActiveTab('bookings')}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className={`flex flex-1 touch-manipulation items-center justify-center space-x-2 rounded-xl px-4 py-2.5 text-sm font-bold shadow-md transition-all sm:flex-initial sm:px-6 sm:py-3 ${
                        activeTab === 'bookings'
                          ? 'bg-gradient-to-r from-[#566614] to-[#6E6B40] text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      style={{ fontFamily: 'LEMON MILK, sans-serif', fontSize: '11px' }}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <span>MY BOOKINGS</span>
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6" style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#566614 #f3f4f6'
              }}>
                {activeTab === 'packages' ? (
                  <div>
                    {/* Empty State */}
                    {!loading && filteredPackages.length === 0 && packages.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-8 text-center mb-6"
                      >
                        <svg className="w-16 h-16 mx-auto mb-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <p className="text-lg font-bold text-yellow-800 mb-2">No packages match your filters</p>
                        <p className="text-sm text-yellow-700 mb-4">Try adjusting your search criteria</p>
                        <button
                          onClick={handleResetFilters}
                          className="bg-gradient-to-r from-[#566614] to-[#6E6B40] text-white px-6 py-2.5 rounded-lg font-bold hover:shadow-lg transition-all"
                          style={{ fontFamily: 'LEMON MILK, sans-serif', fontSize: '11px' }}
                        >
                          CLEAR ALL FILTERS
                        </button>
                      </motion.div>
                    )}

                    {/* Package Grid */}
                    <PackageGrid
                      packages={filteredPackages}
                      loading={loading}
                      showAgency={true}
                      onPackageSelect={(pkg) => {
                        setSelectedPackage(pkg)
                        setShowBookingModal(true)
                      }}
                    />
                  </div>
                ) : (
                  <div>
                    {/* Bookings List */}
                    {loadingBookings ? (
                      <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#566614]"></div>
                        <p className="mt-4 text-gray-600">Loading your bookings...</p>
                      </div>
                    ) : bookings.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gray-50 border-2 border-gray-200 rounded-xl p-12 text-center"
                      >
                        <svg className="w-20 h-20 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <p className="text-xl font-bold text-gray-700 mb-2" style={{ fontFamily: 'LEMON MILK, sans-serif' }}>
                          No Bookings Yet
                        </p>
                        <p className="text-gray-600 mb-6">Start exploring packages and book your dream trip!</p>
                        <button
                          onClick={() => setActiveTab('packages')}
                          className="bg-gradient-to-r from-[#566614] to-[#6E6B40] text-white px-8 py-3 rounded-lg font-bold hover:shadow-lg transition-all"
                          style={{ fontFamily: 'LEMON MILK, sans-serif', fontSize: '12px' }}
                        >
                          BROWSE PACKAGES
                        </button>
                      </motion.div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {bookings.map((booking) => (
                          <motion.div
                            key={booking.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all"
                          >
                            {/* Booking Image */}
                            {booking.package?.images && booking.package.images.length > 0 ? (
                              <img
                                src={booking.package.images[0]}
                                alt={booking.package.title}
                                className="w-full h-48 object-cover"
                                onError={(e) => {
                                  ;(e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/1578750/pexels-photo-1578750.jpeg?w=800&h=600&fit=crop'
                                }}
                              />
                            ) : (
                              <div className="w-full h-48 bg-gradient-to-br from-[#566614] to-[#6E6B40] flex items-center justify-center">
                                <span className="text-white text-lg font-bold">{booking.package?.destination || 'Package'}</span>
                              </div>
                            )}

                            {/* Booking Details */}
                            <div className="p-5">
                              <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1">
                                {booking.package?.title || 'Package'}
                              </h3>
                              <div className="space-y-2 mb-4">
                                <div className="flex items-center text-sm text-gray-600">
                                  <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  </svg>
                                  <span className="truncate">{booking.package?.destination}</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                  <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <span>{booking.package?.duration} days</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                  <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                  </svg>
                                  <span>{booking.travelers} traveler{booking.travelers > 1 ? 's' : ''}</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                  <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  <span>{new Date(booking.bookingDate).toLocaleDateString()}</span>
                                </div>
                              </div>

                              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">Total Amount</p>
                                  <p className="text-xl font-bold text-[#566614]">
                                    PKR {Number(booking.totalAmount).toLocaleString()}
                                  </p>
                                </div>
                                <span
                                  className={`px-3 py-1.5 rounded-full text-xs font-bold ${
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
                              </div>

                              {booking.status === 'PENDING' && (
                                <motion.button
                                  onClick={async () => {
                                    if (confirm('Are you sure you want to cancel this booking?')) {
                                      try {
                                        console.log('Cancelling booking:', booking.id)
                                        const response = await bookingApi.cancel(booking.id)
                                        console.log('Cancel response:', response)
                                        
                                        if (response && response.success) {
                                          alert('✅ Booking cancelled successfully!')
                                          await loadBookings()
                                        } else {
                                          const errorMsg = response?.error?.message || 'Failed to cancel booking'
                                          console.error('Cancel failed:', errorMsg)
                                          alert('❌ ' + errorMsg)
                                        }
                                      } catch (error: any) {
                                        console.error('Cancel booking error:', error)
                                        const errorMsg = error.response?.data?.error?.message || error.message || 'Failed to cancel booking'
                                        alert('❌ ' + errorMsg)
                                      }
                                    }
                                  }}
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  className="mt-4 w-full bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2.5 rounded-lg text-sm font-bold hover:shadow-lg transition-all flex items-center justify-center space-x-2"
                                  style={{ fontFamily: 'LEMON MILK, sans-serif', fontSize: '11px' }}
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                  <span>CANCEL BOOKING</span>
                                </motion.button>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
          </div>
        </div>
      </div>

      {/* Assistant: inline fixed + high z-index (portal + delayed mount hid the FAB for some users) */}
      <AnimatePresence mode="sync">
        {chatOpen && (
          <>
            <motion.div
              key="raahi-chat-backdrop"
              role="presentation"
              className="fixed inset-0 z-[1000] bg-black/45 backdrop-blur-[2px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setChatOpen(false)}
            />
            <motion.div
              key="raahi-chat-panel"
              role="dialog"
              aria-modal="true"
              aria-labelledby="raahi-chat-widget-title"
              className="fixed z-[1001] flex min-h-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0c0e12] shadow-[0_25px_80px_-12px_rgba(0,0,0,0.55)]
              left-[max(0.5rem,env(safe-area-inset-left))] right-[max(0.5rem,env(safe-area-inset-right))]
              top-[max(0.5rem,env(safe-area-inset-top))]
              h-[calc(100dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom)-0.5rem)]
              max-h-[calc(100dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom)-0.5rem)]
              sm:left-auto sm:right-[max(1rem,env(safe-area-inset-right))] sm:top-auto sm:bottom-[max(1rem,env(safe-area-inset-bottom))]
              sm:h-[min(640px,85dvh)]
              sm:max-h-[min(640px,85dvh)]
              sm:w-[min(22.5rem,calc(100vw-3rem))] sm:rounded-3xl"
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            >
              <span id="raahi-chat-widget-title" className="sr-only">
                RAAHI travel assistant chat
              </span>
              <AIChat
                onClose={() => setChatOpen(false)}
                onPackageFilter={handlePackageFilter}
                onPackageSelect={(pkg) => {
                  setSelectedPackage(pkg)
                  setShowBookingModal(true)
                  setActiveTab('packages')
                  setChatOpen(false)
                }}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {!chatOpen && (
        <motion.div
          className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-[max(1.25rem,env(safe-area-inset-right))] z-[1002] flex flex-row items-center gap-2 sm:gap-3"
          initial={false}
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="pointer-events-auto relative max-w-[calc(100vw-2rem)]">
            <motion.button
              type="button"
              onClick={() => setChatOpen(true)}
              className="group relative z-10 flex min-h-[3.5rem] items-center gap-1 overflow-hidden rounded-full bg-gradient-to-br from-[#566614] to-[#6E6B40] py-1.5 pl-2 pr-3 text-white shadow-[0_8px_30px_rgba(86,102,20,0.45)] ring-2 ring-white/25 sm:gap-2 sm:py-2 sm:pl-2.5 sm:pr-4"
              aria-label="Open AI Assistant — travel chat"
              initial={false}
              animate={{
                boxShadow: [
                  '0 8px 30px rgba(86,102,20,0.45)',
                  '0 8px 36px rgba(255,250,195,0.2)',
                  '0 8px 30px rgba(86,102,20,0.45)',
                ],
              }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              whileHover={{
                scale: 1.06,
                y: -3,
                boxShadow:
                  '0 18px 50px rgba(86,102,20,0.55), 0 0 0 1px rgba(255,250,195,0.35), 0 0 28px rgba(255,250,195,0.25)',
                transition: { type: 'spring', stiffness: 420, damping: 22 },
              }}
              whileTap={{ scale: 0.96, y: 0 }}
            >
              <span
                className="pointer-events-none absolute inset-0 -translate-x-full rounded-full bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-0 transition duration-500 ease-out group-hover:translate-x-full group-hover:opacity-100 motion-reduce:transition-none"
                aria-hidden
              />
              <TravelerAiAvatar size="md" title="AI Assistant" subtitle="Tap to chat" />
            </motion.button>
          </div>
        </motion.div>
      )}

      <Footer />

      {/* Booking Modal */}
      {showBookingModal && selectedPackage && (
        <BookingModal
          pkg={selectedPackage}
          onClose={() => {
            setShowBookingModal(false)
            setSelectedPackage(null)
          }}
          onSuccess={() => {
            setShowBookingModal(false)
            setSelectedPackage(null)
            loadBookings()
          }}
        />
      )}
    </div>
  )
}
