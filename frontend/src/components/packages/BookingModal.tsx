import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { bookingApi } from '../../services/api'
import { useAuthStore } from '../../store/authStore'
import type { Package } from '../../types'

interface BookingModalProps {
  pkg: Package | null
  onClose: () => void
  onSuccess: () => void
}

export default function BookingModal({ pkg, onClose, onSuccess }: BookingModalProps) {
  const { isAuthenticated, user, logout } = useAuthStore()
  const [travelers, setTravelers] = useState(1)
  const [bookingDate, setBookingDate] = useState('')
  const [specialRequests, setSpecialRequests] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [bookingData, setBookingData] = useState<any>(null)

  if (!pkg) return null

  const totalAmount = Number(pkg.price) * travelers

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isAuthenticated) {
      setError('Please login to book a package')
      return
    }

    // Verify user is valid
    if (!user || !user.id) {
      setError('Your session is invalid. Please logout and login again.')
      setTimeout(() => {
        logout()
        window.location.href = '/login/user'
      }, 2000)
      return
    }

    // Verify user role
    if (user.role !== 'TOURIST') {
      setError('Only tourists can book packages. Please login as a tourist.')
      return
    }

    if (!bookingDate) {
      setError('Please select a booking date')
      return
    }

    // Validate package ID
    if (!pkg.id) {
      setError('Invalid package. Please try selecting the package again.')
      return
    }

    setError('')
    setLoading(true)

    try {
      // Validate package ID
      if (!pkg.id) {
        setError('Invalid package. Please try selecting the package again.')
        setLoading(false)
        return
      }

      const response = await bookingApi.create({
        packageId: pkg.id,
        travelers,
        bookingDate: new Date(bookingDate).toISOString(),
        specialRequests: specialRequests || undefined,
      })

      if (response.success && response.data) {
        setBookingData(response.data)
        setSuccess(true)
        setError('')
        // Show success message for 5 seconds before closing
        setTimeout(() => {
          onSuccess()
          onClose()
        }, 5000)
      } else {
        const errorMsg = response.error?.message || 'Failed to create booking. Please try again.'
        setError(errorMsg)
        
        // If user not found or invalid user, prompt to re-login
        if (response.error?.code === 'NOT_FOUND' || 
            response.error?.code === 'UNAUTHORIZED' || 
            response.error?.code === 'INVALID_USER') {
          setTimeout(() => {
            logout()
            window.location.href = '/login/user'
          }, 3000)
        }
        
        setLoading(false)
      }
    } catch (err: any) {
      console.error('Booking error:', err)
      let errorMessage = 'An error occurred while booking. Please try again.'
      let shouldRedirect = false
      
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error.message || errorMessage
        // Handle specific error cases
        if (err.response.data.error.code === 'UNAUTHORIZED' || 
            err.response.data.error.code === 'INVALID_USER' ||
            err.response.status === 401) {
          errorMessage = 'Your session has expired or account is invalid. Redirecting to login...'
          shouldRedirect = true
        } else if (err.response.data.error.code === 'INVALID_DATA' || 
                   err.response.data.error.code === 'P2003' || 
                   err.response.data.error.code === 'NOT_FOUND') {
          errorMessage = 'User account issue detected. Please logout and login again.'
          shouldRedirect = true
        }
      } else if (err.message) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
      setLoading(false)
      
      if (shouldRedirect) {
        setTimeout(() => {
          logout()
          window.location.href = '/login/user'
        }, 3000)
      }
    }
  }

  const minDate = new Date().toISOString().split('T')[0]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] flex flex-col"
        >
          <div className="bg-[#566614] text-white p-4 rounded-t-lg flex justify-between items-center flex-shrink-0">
            <h2 className="text-xl font-bold" style={{ fontFamily: 'LEMON MILK, sans-serif' }}>
              Book Package
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="overflow-y-auto flex-1 booking-modal-scroll" style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#566614 #f3f4f6'
          }}>
          {success ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 text-center"
            >
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3" style={{ fontFamily: 'LEMON MILK, sans-serif' }}>
                🎉 Booking Confirmed!
              </h3>
              <p className="text-gray-700 text-lg mb-4 font-semibold">Your order has been successfully booked!</p>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-5 mt-4 shadow-md">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-700">Booking ID:</span>
                    <span className="text-sm font-mono text-gray-900">{bookingData?.id?.substring(0, 8) || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-700">Package:</span>
                    <span className="text-sm text-gray-900 text-right">{pkg.title}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-700">Destination:</span>
                    <span className="text-sm text-gray-900">{pkg.destination}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-700">Duration:</span>
                    <span className="text-sm text-gray-900">{pkg.duration} days</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-700">Travelers:</span>
                    <span className="text-sm text-gray-900">{travelers}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-700">Booking Date:</span>
                    <span className="text-sm text-gray-900">{new Date(bookingDate).toLocaleDateString()}</span>
                  </div>
                  <div className="border-t border-green-300 pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-base font-bold text-gray-900">Total Amount:</span>
                      <span className="text-xl font-bold text-[#566614]">PKR {totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-green-300">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      bookingData?.status === 'PENDING' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      Status: {bookingData?.status || 'PENDING'}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-gray-600 mt-4 text-sm">
                ✅ The agency has been notified about your booking.<br/>
                📋 You can view your booking details in the "My Bookings" section.
              </p>
              <motion.button
                onClick={() => {
                  onSuccess()
                  onClose()
                }}
                className="mt-6 px-6 py-2 bg-[#566614] text-white rounded-lg hover:bg-[#6E6B40] transition-colors font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Close
              </motion.button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Package Info */}
              <div className="border-b pb-4">
                <h3 className="font-bold text-lg mb-2">{pkg.title}</h3>
                <p className="text-gray-600 text-sm">{pkg.destination}</p>
                <p className="text-gray-600 text-sm">Duration: {pkg.duration} days</p>
              </div>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Travelers *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max={pkg.maxTravelers}
                  value={travelers}
                  onChange={(e) => setTravelers(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#566614]"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Maximum {pkg.maxTravelers} travelers
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Booking Date *
                </label>
                <input
                  type="date"
                  required
                  min={minDate}
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#566614]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Special Requests (Optional)
                </label>
                <textarea
                  rows={3}
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="Any special requirements or requests..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#566614]"
                />
              </div>

              {/* Price Summary */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Price per person:</span>
                  <span className="font-medium">PKR {Number(pkg.price).toLocaleString()}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Travelers:</span>
                  <span className="font-medium">{travelers}</span>
                </div>
                <div className="border-t pt-2 flex justify-between">
                  <span className="font-bold text-lg">Total Amount:</span>
                  <span className="font-bold text-lg text-[#566614]">
                    PKR {totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex flex-col space-y-3 pt-4">
                {bookingDate && travelers > 0 && (
                  <motion.button
                    type="submit"
                    disabled={loading || !isAuthenticated}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full px-6 py-3 bg-gradient-to-r from-[#566614] to-[#6E6B40] text-white rounded-lg hover:from-[#6E6B40] hover:to-[#566614] disabled:opacity-50 transition-all font-bold text-lg shadow-lg hover:shadow-xl"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      'Book Now'
                    )}
                  </motion.button>
                )}
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  {(!bookingDate || travelers === 0) && (
                    <button
                      type="button"
                      disabled
                      className="flex-1 px-4 py-2 bg-gray-300 text-gray-500 rounded-md cursor-not-allowed"
                    >
                      Select Date & Travelers
                    </button>
                  )}
                </div>
              </div>

              {!isAuthenticated && (
                <p className="text-sm text-red-600 text-center">
                  Please login to book this package
                </p>
              )}
            </form>
          )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
