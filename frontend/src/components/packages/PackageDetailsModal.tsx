import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { packageApi } from '../../services/api'
import type { Package } from '../../types'

interface PackageDetailsModalProps {
  packageId: string | null
  onClose: () => void
  onBook?: (pkg: Package) => void
}

export default function PackageDetailsModal({ packageId, onClose, onBook }: PackageDetailsModalProps) {
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
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col"
        >
          <div className="bg-[#566614] text-white p-4 rounded-t-lg flex justify-between items-center flex-shrink-0">
            <h2 className="text-xl font-bold" style={{ fontFamily: 'LEMON MILK, sans-serif' }}>
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

          <div className="overflow-y-auto flex-1 booking-modal-scroll p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#566614]"></div>
                <p className="mt-4 text-gray-600">Loading package details...</p>
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
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Left Side - Big Image Gallery */}
                <div className="lg:w-1/2">
                  {pkg.images && pkg.images.length > 0 ? (
                    <div className="space-y-3 sticky top-0">
                      {/* Main Large Image */}
                      <div className="relative group">
                        <img
                          src={pkg.images[0]}
                          alt={pkg.title}
                          className="w-full h-[400px] object-cover rounded-xl shadow-lg"
                          onError={(e) => {
                            ;(e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/1578750/pexels-photo-1578750.jpeg?w=800&h=600&fit=crop'
                          }}
                        />
                        {/* Destination Badge */}
                        <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-lg flex items-center space-x-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                          <span className="font-semibold">{pkg.destination}</span>
                        </div>
                        {/* Rating Badge */}
                        {pkg.rating > 0 && (
                          <div className="absolute top-4 right-4 bg-[#566614]/90 backdrop-blur-sm text-white px-3 py-2 rounded-lg flex items-center space-x-1">
                            <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="font-bold">{pkg.rating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Thumbnail Images */}
                      {pkg.images.length > 1 && (
                        <div className="grid grid-cols-3 gap-2">
                          {pkg.images.slice(1, 4).map((img, idx) => (
                            <img
                              key={idx}
                              src={img}
                              alt={`${pkg.title} - Image ${idx + 2}`}
                              className="w-full h-24 object-cover rounded-lg hover:opacity-80 transition-opacity cursor-pointer shadow-md"
                              onError={(e) => {
                                ;(e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/1118877/pexels-photo-1118877.jpeg?w=800&h=600&fit=crop'
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-full h-[400px] bg-gradient-to-br from-[#566614] to-[#6E6B40] rounded-xl flex items-center justify-center shadow-lg">
                      <div className="text-center text-white">
                        <svg className="w-20 h-20 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-2xl font-bold">{pkg.destination}</p>
                        <p className="text-sm opacity-75 mt-2">No images available</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Side - Package Details */}
                <div className="lg:w-1/2 space-y-5 overflow-y-auto max-h-[600px] pr-2">
                  {/* Package Title */}
                  <div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-3" style={{ fontFamily: 'LEMON MILK, sans-serif' }}>
                      {pkg.title}
                    </h3>
                    <div className="flex items-center space-x-4 text-gray-600">
                      <span className="flex items-center bg-gray-100 px-3 py-1.5 rounded-full">
                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {pkg.duration} days
                      </span>
                      <span className="flex items-center bg-gray-100 px-3 py-1.5 rounded-full">
                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  <div className="bg-gradient-to-r from-[#566614] to-[#6E6B40] p-5 rounded-xl text-white shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        {pkg.originalPrice && Number(pkg.originalPrice) > Number(pkg.price) ? (
                          <div>
                            <span className="text-lg line-through opacity-75 mr-2">
                              PKR {Number(pkg.originalPrice).toLocaleString()}
                            </span>
                            <div className="text-4xl font-bold">
                              PKR {Number(pkg.price).toLocaleString()}
                            </div>
                            <p className="text-sm opacity-90 mt-1">per person · Save {Math.round(((Number(pkg.originalPrice) - Number(pkg.price)) / Number(pkg.originalPrice)) * 100)}%</p>
                          </div>
                        ) : (
                          <div>
                            <div className="text-4xl font-bold">
                              PKR {Number(pkg.price).toLocaleString()}
                            </div>
                            <p className="text-sm opacity-90 mt-1">per person</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {pkg.description && (
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 mb-2">About This Package</h4>
                      <p className="text-gray-700 leading-relaxed">{pkg.description}</p>
                    </div>
                  )}

                  {/* What's Included */}
                  {pkg.includes && pkg.includes.length > 0 && (
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        What's Included
                      </h4>
                      <div className="grid grid-cols-1 gap-2">
                        {pkg.includes.map((item, idx) => (
                          <div key={idx} className="flex items-start text-gray-700 bg-green-50 p-2 rounded-lg">
                            <svg className="w-5 h-5 mr-2 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  <div className="flex space-x-3 pt-4 border-t border-gray-200 sticky bottom-0 bg-white pb-2">
                    <button
                      onClick={onClose}
                      className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                    >
                      Close
                    </button>
                    {onBook && (
                      <motion.button
                        onClick={() => {
                          onBook(pkg)
                          onClose()
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-[#566614] to-[#6E6B40] text-white rounded-lg hover:from-[#6E6B40] hover:to-[#566614] transition-all font-bold shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
