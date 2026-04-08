import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { packageApi } from '../../services/api'
import type { Package } from '../../types'

interface PackageDetailsModalProps {
  packageId: string | null
  onClose: () => void
  onBook?: (pkg: Package) => void
  /** Tighter layout + higher z-index for use inside the AI chat overlay */
  variant?: 'default' | 'compact'
}

export default function PackageDetailsModal({
  packageId,
  onClose,
  onBook,
  variant = 'default',
}: PackageDetailsModalProps) {
  const isCompact = variant === 'compact'
  const [pkg, setPkg] = useState<Package | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!packageId) return

    const fetchPackage = async () => {
      try {
        setLoading(true)
        setError('')
        const response = await packageApi.getById(packageId)
        if (response.success && response.data) {
          setPkg(response.data)
        } else {
          setError(response.error?.message || 'Failed to load package details')
        }
      } catch (err: any) {
        setError(err.response?.data?.error?.message || 'An error occurred while loading package details')
      } finally {
        setLoading(false)
      }
    }

    fetchPackage()
  }, [packageId])

  if (!packageId) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`fixed inset-0 flex items-center justify-center bg-black/50 ${
          isCompact ? 'z-[1100] p-3 sm:p-4' : 'z-50 p-4'
        }`}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose()
        }}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className={`flex w-full flex-col overflow-hidden rounded-xl bg-white shadow-xl ${
            isCompact ? 'max-h-[88dvh] max-w-md sm:max-w-lg' : 'max-h-[90dvh] max-w-3xl'
          }`}
        >
          <div className="flex flex-shrink-0 items-center justify-between rounded-t-xl bg-[#566614] p-3 text-white sm:p-4">
            <h2
              className={`font-bold ${isCompact ? 'text-base sm:text-lg' : 'text-xl'}`}
              style={{ fontFamily: 'LEMON MILK, sans-serif' }}
            >
              Package Details
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

          <div
            className={`booking-modal-scroll flex-1 overflow-y-auto ${isCompact ? 'p-4' : 'p-6'}`}
          >
            {loading ? (
              <div className={`text-center ${isCompact ? 'py-8' : 'py-12'}`}>
                <div
                  className={`inline-block animate-spin rounded-full border-b-2 border-[#566614] ${
                    isCompact ? 'h-9 w-9' : 'h-12 w-12'
                  }`}
                />
                <p className={`mt-3 text-gray-600 ${isCompact ? 'text-sm' : ''}`}>
                  Loading package details…
                </p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="text-red-500 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-red-600 font-semibold">{error}</p>
                <button
                  onClick={onClose}
                  className="mt-4 px-6 py-2 bg-[#566614] text-white rounded-lg hover:bg-[#6E6B40] transition-colors"
                >
                  Close
                </button>
              </div>
            ) : pkg ? (
              <div className={isCompact ? 'flex flex-col gap-4' : 'flex flex-col gap-6 lg:flex-row'}>
                {/* Left Side - Big Image Gallery */}
                <div className={isCompact ? 'w-full shrink-0' : 'lg:w-1/2'}>
                  {pkg.images && pkg.images.length > 0 ? (
                    <div className={isCompact ? 'space-y-2' : 'sticky top-0 space-y-3'}>
                      {/* Main Large Image */}
                      <div className="group relative">
                        <img
                          src={pkg.images[0]}
                          alt={pkg.title}
                          className={`w-full rounded-xl object-cover shadow-lg ${
                            isCompact ? 'h-40 max-h-[36vh] sm:h-44' : 'h-[400px]'
                          }`}
                          onError={(e) => {
                            ;(e.target as HTMLImageElement).src =
                              'https://images.pexels.com/photos/1578750/pexels-photo-1578750.jpeg?w=800&h=600&fit=crop'
                          }}
                        />
                        {/* Destination Badge */}
                        <div
                          className={`absolute flex items-center rounded-lg bg-black/70 text-white backdrop-blur-sm ${
                            isCompact
                              ? 'left-2 top-2 space-x-1.5 px-2 py-1 text-xs'
                              : 'left-4 top-4 space-x-2 px-4 py-2'
                          }`}
                        >
                          <svg
                            className={isCompact ? 'h-3.5 w-3.5' : 'h-5 w-5'}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                          </svg>
                          <span className="font-semibold">{pkg.destination}</span>
                        </div>
                        {/* Rating Badge */}
                        {pkg.rating > 0 && (
                          <div
                            className={`absolute flex items-center rounded-lg bg-[#566614]/90 text-white backdrop-blur-sm ${
                              isCompact
                                ? 'right-2 top-2 space-x-0.5 px-2 py-1 text-xs'
                                : 'right-4 top-4 space-x-1 px-3 py-2'
                            }`}
                          >
                            <svg
                              className={`text-yellow-400 ${isCompact ? 'h-3.5 w-3.5' : 'h-5 w-5'}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="font-bold">{pkg.rating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>

                      {/* Thumbnail Images */}
                      {pkg.images.length > 1 && (
                        <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                          {pkg.images.slice(1, 4).map((img, idx) => (
                            <img
                              key={idx}
                              src={img}
                              alt={`${pkg.title} - Image ${idx + 2}`}
                              className={`w-full rounded-lg object-cover shadow-md transition-opacity hover:opacity-80 ${
                                isCompact ? 'h-14' : 'h-24'
                              }`}
                              onError={(e) => {
                                ;(e.target as HTMLImageElement).src =
                                  'https://images.pexels.com/photos/1118877/pexels-photo-1118877.jpeg?w=800&h=600&fit=crop'
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div
                      className={`flex w-full items-center justify-center rounded-xl bg-gradient-to-br from-[#566614] to-[#6E6B40] shadow-lg ${
                        isCompact ? 'h-40' : 'h-[400px]'
                      }`}
                    >
                      <div className="text-center text-white">
                        <svg
                          className={`mx-auto mb-2 opacity-50 ${isCompact ? 'h-12 w-12' : 'mb-4 h-20 w-20'}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <p className={`font-bold ${isCompact ? 'text-lg' : 'text-2xl'}`}>{pkg.destination}</p>
                        <p className="mt-1 text-sm opacity-75">No images available</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Side - Package Details */}
                <div
                  className={
                    isCompact
                      ? 'w-full space-y-3'
                      : 'max-h-[600px] space-y-5 overflow-y-auto pr-2 lg:w-1/2'
                  }
                >
                  {/* Package Title */}
                  <div>
                    <h3
                      className={`font-bold text-gray-900 ${isCompact ? 'mb-2 text-lg leading-snug' : 'mb-3 text-3xl'}`}
                      style={{ fontFamily: 'LEMON MILK, sans-serif' }}
                    >
                      {pkg.title}
                    </h3>
                    <div
                      className={`flex flex-wrap items-center gap-2 text-gray-600 ${isCompact ? 'text-xs' : 'space-x-4'}`}
                    >
                      <span className="flex items-center rounded-full bg-gray-100 px-2.5 py-1 sm:px-3 sm:py-1.5">
                        <svg className="mr-1 h-3.5 w-3.5 sm:mr-1.5 sm:h-4 sm:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {pkg.duration} days
                      </span>
                      <span className="flex items-center rounded-full bg-gray-100 px-2.5 py-1 sm:px-3 sm:py-1.5">
                        <svg className="mr-1 h-3.5 w-3.5 sm:mr-1.5 sm:h-4 sm:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        {pkg.minTravelers}-{pkg.maxTravelers} travelers
                      </span>
                      {pkg.totalReviews > 0 && (
                        <span className="text-sm text-gray-600">
                          ({pkg.totalReviews} reviews)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Price Section */}
                  <div
                    className={`rounded-xl bg-gradient-to-r from-[#566614] to-[#6E6B40] text-white shadow-lg ${
                      isCompact ? 'p-3' : 'p-5'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        {pkg.originalPrice && Number(pkg.originalPrice) > Number(pkg.price) ? (
                          <div>
                            <span
                              className={`mr-2 line-through opacity-75 ${isCompact ? 'text-sm' : 'text-lg'}`}
                            >
                              PKR {Number(pkg.originalPrice).toLocaleString()}
                            </span>
                            <div className={`font-bold ${isCompact ? 'text-2xl' : 'text-4xl'}`}>
                              PKR {Number(pkg.price).toLocaleString()}
                            </div>
                            <p className={`mt-1 opacity-90 ${isCompact ? 'text-xs' : 'text-sm'}`}>
                              per person · Save{' '}
                              {Math.round(
                                ((Number(pkg.originalPrice) - Number(pkg.price)) /
                                  Number(pkg.originalPrice)) *
                                  100
                              )}
                              %
                            </p>
                          </div>
                        ) : (
                          <div>
                            <div className={`font-bold ${isCompact ? 'text-2xl' : 'text-4xl'}`}>
                              PKR {Number(pkg.price).toLocaleString()}
                            </div>
                            <p className={`mt-1 opacity-90 ${isCompact ? 'text-xs' : 'text-sm'}`}>
                              per person
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {pkg.description && (
                    <div>
                      <h4
                        className={`font-bold text-gray-900 ${isCompact ? 'mb-1.5 text-sm' : 'mb-2 text-lg'}`}
                      >
                        About This Package
                      </h4>
                      <p
                        className={`leading-relaxed text-gray-700 ${isCompact ? 'text-sm' : ''}`}
                      >
                        {pkg.description}
                      </p>
                    </div>
                  )}

                  {/* What's Included */}
                  {pkg.includes && pkg.includes.length > 0 && (
                    <div>
                      <h4
                        className={`mb-2 flex items-center font-bold text-gray-900 sm:mb-3 ${
                          isCompact ? 'text-sm' : 'text-lg'
                        }`}
                      >
                        <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        What's Included
                      </h4>
                      <div className={`grid grid-cols-1 gap-2 ${isCompact ? 'gap-1.5' : ''}`}>
                        {pkg.includes.map((item, idx) => (
                          <div
                            key={idx}
                            className={`flex items-start rounded-lg bg-green-50 text-gray-700 ${
                              isCompact ? 'p-1.5 text-xs' : 'p-2'
                            }`}
                          >
                            <svg
                              className={`mr-2 flex-shrink-0 text-green-600 ${isCompact ? 'mt-0.5 h-3.5 w-3.5' : 'mt-0.5 h-5 w-5'}`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* What's Not Included */}
                  {pkg.excludes && pkg.excludes.length > 0 && (
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        What's Not Included
                      </h4>
                      <div className="grid grid-cols-1 gap-2">
                        {pkg.excludes.map((item, idx) => (
                          <div key={idx} className="flex items-start text-gray-700 bg-red-50 p-2 rounded-lg">
                            <svg className="w-5 h-5 mr-2 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Itinerary */}
                  {pkg.itinerary && typeof pkg.itinerary === 'object' && Object.keys(pkg.itinerary).length > 0 && (
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-[#566614]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Daily Itinerary
                      </h4>
                      <div className="space-y-3">
                        {Object.entries(pkg.itinerary).map(([day, details]: [string, any], idx) => (
                          <div key={day} className="bg-gray-50 p-4 rounded-lg border-l-4 border-[#566614]">
                            <div className="flex items-start">
                              <div className="flex-shrink-0 w-8 h-8 bg-[#566614] text-white rounded-full flex items-center justify-center font-bold text-sm mr-3">
                                {idx + 1}
                              </div>
                              <div className="flex-1">
                                <h5 className="font-semibold text-gray-900 mb-1">{day}</h5>
                                <p className="text-gray-700 text-sm">{typeof details === 'string' ? details : JSON.stringify(details)}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Cancellation Policy */}
                  {pkg.cancellationPolicy && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
                      <h4 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        Cancellation Policy
                      </h4>
                      <p className="text-gray-700 text-sm">{pkg.cancellationPolicy}</p>
                    </div>
                  )}

                  {/* Agency Info */}
                  {pkg.agency && (
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200">
                      <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-[#566614]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        Tour Operator
                      </h4>
                      <p className="text-gray-900 font-semibold text-lg mb-2">{pkg.agency.agencyName}</p>
                      <div className="space-y-1 text-sm">
                        {pkg.agency.contactEmail && (
                          <div className="flex items-center text-gray-600">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            {pkg.agency.contactEmail}
                          </div>
                        )}
                        {pkg.agency.contactPhone && (
                          <div className="flex items-center text-gray-600">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            {pkg.agency.contactPhone}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div
                    className={`sticky bottom-0 flex gap-2 border-t border-gray-200 bg-white pt-3 sm:gap-3 sm:space-x-0 ${
                      isCompact ? 'pb-1' : 'pb-2 pt-4'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={onClose}
                      className={`flex-1 rounded-lg border-2 border-gray-300 font-semibold transition-colors hover:bg-gray-50 ${
                        isCompact ? 'px-3 py-2.5 text-sm' : 'px-6 py-3'
                      }`}
                    >
                      Close
                    </button>
                    {onBook && (
                      <motion.button
                        type="button"
                        onClick={() => {
                          onBook(pkg)
                          onClose()
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#566614] to-[#6E6B40] font-bold text-white shadow-lg transition-all hover:from-[#6E6B40] hover:to-[#566614] hover:shadow-xl ${
                          isCompact ? 'px-3 py-2.5 text-sm' : 'px-6 py-3'
                        }`}
                      >
                        <svg className={isCompact ? 'h-4 w-4' : 'h-5 w-5'} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Book Now</span>
                      </motion.button>
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
