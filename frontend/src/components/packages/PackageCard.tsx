import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuthStore } from '../../store/authStore'
import BookingModal from './BookingModal'
import type { Package } from '../../types'

interface PackageCardProps {
  pkg: Package
  onClick?: () => void
  showAgency?: boolean
}

export default function PackageCard({ pkg, onClick, showAgency = true }: PackageCardProps) {
  const { isAuthenticated } = useAuthStore()
  const [showBookingModal, setShowBookingModal] = useState(false)
  const discount = pkg.originalPrice && pkg.originalPrice > pkg.price
    ? Math.round(((Number(pkg.originalPrice) - Number(pkg.price)) / Number(pkg.originalPrice)) * 100)
    : 0

  const handleBookNow = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    if (!isAuthenticated) {
      alert('Please login to book a package')
      return
    }
    setShowBookingModal(true)
  }

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger if clicking on button or interactive elements
    const target = e.target as HTMLElement
    if (target.tagName === 'BUTTON' || target.closest('button')) {
      return
    }
    
    // Always open booking modal when card is clicked
    if (onClick) {
      onClick()
    } else {
      setShowBookingModal(true)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, scale: 1.02, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="bg-white rounded-xl shadow-md hover:shadow-2xl overflow-hidden cursor-pointer group h-full flex flex-col relative ring-1 ring-gray-200 hover:ring-[#566614]/50"
      onClick={handleCardClick}
    >
      {/* Click Indicator Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#566614]/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-sm px-6 py-3 rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100">
          <p className="text-[#566614] font-bold text-sm flex items-center space-x-2" style={{ fontFamily: 'LEMON MILK, sans-serif' }}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>VIEW DETAILS</span>
          </p>
        </div>
      </div>

      {/* Image Container with Overlay - Fixed Height */}
      <div className="relative overflow-hidden flex-shrink-0">
        {pkg.images && pkg.images.length > 0 ? (
          <motion.img
            src={pkg.images[0]}
            alt={pkg.title}
            className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-300"
            onError={(e) => {
              ;(e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/1578750/pexels-photo-1578750.jpeg?w=800&h=600&fit=crop'
            }}
          />
        ) : (
          <div className="w-full h-56 bg-gradient-to-br from-[#566614] to-[#6E6B40] flex items-center justify-center">
            <span className="text-white text-xl font-bold">{pkg.destination}</span>
          </div>
        )}
        
        {/* Discount Badge */}
        {discount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg"
          >
            {discount}% OFF
          </motion.div>
        )}

        {/* Rating Badge - Standardized Size */}
        {pkg.rating > 0 && (
          <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg flex items-center space-x-1 shadow-md">
            <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-sm font-bold text-gray-900">{pkg.rating.toFixed(1)}</span>
          </div>
        )}

        {/* Agency Badge - Standardized Size */}
        {showAgency && pkg.agency && (
          <div className="absolute bottom-3 left-3 bg-[#566614]/95 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-md">
            {pkg.agency.agencyName}
          </div>
        )}
      </div>

      {/* Content - Flex Grow to Fill Space */}
      <div className="p-5 flex flex-col flex-1">
        {/* Title - Fixed Height with Line Clamp */}
        <h3 className="text-lg font-bold mb-2 text-gray-900 line-clamp-2 h-14" style={{ fontFamily: 'Calibri Bold, sans-serif' }}>
          {pkg.title}
        </h3>
        
        {/* Destination - Fixed Height */}
        <p className="text-[#566614] font-semibold mb-3 flex items-center text-sm h-6">
          <svg className="w-4 h-4 mr-1.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="truncate">{pkg.destination}</span>
        </p>

        {/* Package Info - Fixed Height */}
        <div className="flex items-center space-x-3 mb-4 text-xs text-gray-600 h-5">
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {pkg.duration} days
          </span>
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {pkg.maxTravelers} max
          </span>
        </div>

        {/* Spacer to push price and button to bottom */}
        <div className="flex-1"></div>

        {/* Price - Fixed Height */}
        <div className="mb-4">
          {pkg.originalPrice && Number(pkg.originalPrice) > Number(pkg.price) ? (
            <div>
              <span className="text-sm text-gray-400 line-through block">
                PKR {Number(pkg.originalPrice).toLocaleString()}
              </span>
              <span className="text-2xl font-bold text-[#566614] block">
                PKR {Number(pkg.price).toLocaleString()}
              </span>
            </div>
          ) : (
            <span className="text-2xl font-bold text-[#566614] block">
              PKR {Number(pkg.price).toLocaleString()}
            </span>
          )}
          <p className="text-xs text-gray-500 mt-1">per person</p>
        </div>

        {/* CTA Button - Fixed Height */}
        <motion.button
          onClick={handleBookNow}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-gradient-to-r from-[#566614] to-[#6E6B40] text-white py-3 rounded-lg hover:shadow-lg transition-all text-center font-bold"
          style={{ fontFamily: 'LEMON MILK, sans-serif', fontSize: '11px' }}
        >
          BOOK NOW
        </motion.button>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <BookingModal
          pkg={pkg}
          onClose={() => setShowBookingModal(false)}
          onSuccess={() => {
            setShowBookingModal(false)
            if (onClick) onClick()
          }}
        />
      )}
    </motion.div>
  )
}
