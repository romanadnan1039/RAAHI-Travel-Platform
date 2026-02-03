import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { aiApi, packageApi } from '../../services/api'
import ChatMessage from './ChatMessage'
import BookingModal from '../packages/BookingModal'
import PackageDetailsModal from '../packages/PackageDetailsModal'
import { useAuthStore } from '../../store/authStore'
import type { Package } from '../../types'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  recommendations?: Package[]
}

interface AIChatProps {
  onPackageFilter?: (filters: any) => void
  onPackageSelect?: (pkg: Package) => void
}

export default function AIChat({ onPackageFilter, onPackageSelect }: AIChatProps) {
  const { isAuthenticated, user } = useAuthStore()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your RAAHI travel assistant. I can help you find the perfect travel package. For example, you can ask: \"I want to go to Hunza for 2 days under 20K\" or \"Mujhe Swat jana hai 3 din ke liye\"",
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | undefined>()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [shouldScroll, setShouldScroll] = useState(false)
  const isUserScrolling = useRef(false)
  const scrollTimeoutRef = useRef<number | undefined>()
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null)

  const scrollToBottom = () => {
    if (messagesEndRef.current && shouldScroll) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }

  useEffect(() => {
    if (shouldScroll) {
      scrollToBottom()
      setShouldScroll(false)
    }
  }, [messages, shouldScroll])

  useEffect(() => {
    const messagesContainer = messagesEndRef.current?.parentElement
    if (!messagesContainer) return

    const handleScroll = () => {
      isUserScrolling.current = true
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
      scrollTimeoutRef.current = setTimeout(() => {
        isUserScrolling.current = false
      }, 1000)
    }

    messagesContainer.addEventListener('scroll', handleScroll)
    return () => {
      messagesContainer.removeEventListener('scroll', handleScroll)
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    }

    setMessages((prev) => [...prev, userMessage])
    setShouldScroll(true)
    const userInput = input
    setInput('')
    setLoading(true)

    try {
      const response = await aiApi.chat(userInput, conversationId)
      if (response.success && response.data) {
        // Map recommendations to ensure they have 'id' field (convert packageId to id)
        const recommendations = (response.data.recommendations || []).map((rec: any) => ({
          ...rec,
          id: rec.id || rec.packageId, // Use id if exists, otherwise use packageId
          packageId: rec.packageId || rec.id, // Keep packageId for reference
        }))
        
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.data.response,
          recommendations: recommendations,
        }
        setMessages((prev) => [...prev, assistantMessage])
        setShouldScroll(true)
        if (response.data.conversationId) {
          setConversationId(response.data.conversationId)
        }

        if (onPackageFilter && userInput) {
          const filters: any = {}
          if (userInput.toLowerCase().includes('hunza')) filters.destination = 'Hunza'
          if (userInput.toLowerCase().includes('swat')) filters.destination = 'Swat'
          if (userInput.toLowerCase().includes('naran')) filters.destination = 'Naran'
          if (userInput.toLowerCase().includes('skardu')) filters.destination = 'Skardu'
          
          const priceMatch = userInput.match(/(\d+)k|(\d+)\s*k|under\s*(\d+)/i)
          if (priceMatch) {
            const price = parseInt(priceMatch[1] || priceMatch[2] || priceMatch[3] || '0') * 1000
            filters.maxPrice = price.toString()
          }
          
          const durationMatch = userInput.match(/(\d+)\s*days?|(\d+)\s*din/i)
          if (durationMatch) {
            filters.duration = (durationMatch[1] || durationMatch[2] || '').toString()
          }

          if (Object.keys(filters).length > 0) {
            onPackageFilter(filters)
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
      }
      setMessages((prev) => [...prev, errorMessage])
      setShouldScroll(true)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectRecommendation = (pkg: Package) => {
    if (onPackageSelect) {
      onPackageSelect(pkg)
    }
  }

  const handleBookNow = async (pkg: Package | any) => {
    if (!isAuthenticated || user?.role !== 'TOURIST') {
      alert('Please login as a tourist to book a package.')
      return
    }
    
    // If package doesn't have full details, fetch them
    const packageId = pkg.id || pkg.packageId
    if (!packageId) {
      alert('Package ID is missing. Please try again.')
      return
    }

    // If package has minimal fields, fetch full details
    if (!pkg.description || !pkg.includes || !pkg.images || pkg.images.length === 0) {
      try {
        const response = await packageApi.getById(packageId)
        if (response.success && response.data) {
          setSelectedPackage(response.data)
          setShowBookingModal(true)
        } else {
          alert('Failed to load package details. Please try again.')
        }
      } catch (error) {
        console.error('Error fetching package:', error)
        alert('Failed to load package details. Please try again.')
      }
    } else {
      setSelectedPackage(pkg)
      setShowBookingModal(true)
    }
  }

  const handleShowDetails = (pkg: Package | any) => {
    const packageId = pkg.id || pkg.packageId
    if (!packageId) {
      alert('Package ID is missing. Please try again.')
      return
    }
    setSelectedPackageId(packageId)
    setShowDetailsModal(true)
  }

  return (
    <div className="bg-gray-900 rounded-2xl shadow-2xl h-full min-h-[400px] flex flex-col border border-gray-700/50 overflow-hidden">
      {/* Dark Header - Layla AI Style */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-[#566614] to-[#6E6B40] rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h2 className="text-white font-semibold text-sm" style={{ fontFamily: 'LEMON MILK, sans-serif' }}>
              RAAHI AI Assistant
            </h2>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-400">Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area - Dark Scrollable - Now in Middle */}
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-900" 
        style={{ 
          scrollbarWidth: 'thin',
          scrollbarColor: '#566614 #1f2937'
        }}
      >
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChatMessage
                message={message}
                onSelectRecommendation={handleSelectRecommendation}
              />
              
              {/* Show Package Cards for Recommendations */}
              {message.recommendations && message.recommendations.length > 0 && (
                <div className="mt-4 space-y-3">
                  <p className="text-xs font-medium text-gray-400 mb-3 uppercase tracking-wide">
                    Recommended Packages
                  </p>
                  <div className="grid grid-cols-1 gap-3">
                    {message.recommendations.map((pkg, idx) => {
                      // Debug log to check images
                      console.log(`Recommendation ${idx + 1}: ${pkg.title}`, {
                        hasImages: !!pkg.images,
                        imageCount: pkg.images ? pkg.images.length : 0,
                        firstImage: pkg.images && pkg.images[0] ? pkg.images[0].substring(0, 50) : 'none'
                      })
                      
                      return (
                        <motion.div
                          key={pkg.id || `pkg-${idx}`}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.2 }}
                          className="cursor-pointer"
                        >
                          <div
                            className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50 hover:border-[#566614]/50 hover:bg-gray-800 transition-all shadow-lg"
                          >
                            {(pkg.images && pkg.images.length > 0) ? (
                              <img
                                src={pkg.images[0]}
                                alt={pkg.title}
                                className="w-full h-40 object-cover rounded-lg mb-3"
                                onError={(e) => {
                                  console.error(`Image failed to load for ${pkg.title}:`, pkg.images[0])
                                  ;(e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/1578750/pexels-photo-1578750.jpeg?w=800&h=600&fit=crop'
                                }}
                              />
                            ) : (
                              <div className="w-full h-40 bg-gradient-to-br from-[#566614] to-[#6E6B40] rounded-lg mb-3 flex items-center justify-center">
                                <span className="text-white text-lg font-bold">{pkg.destination || 'Package'}</span>
                              </div>
                            )}
                          <div className="space-y-2">
                            <div>
                              <h4 className="font-semibold text-white text-sm mb-1">{pkg.title}</h4>
                              <div className="flex items-center space-x-3 text-xs text-gray-400 mb-2">
                                <span className="flex items-center">
                                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  </svg>
                                  {pkg.destination}
                                </span>
                                <span>{pkg.duration} days</span>
                              </div>
                              {/* Package Details */}
                              {pkg.includes && pkg.includes.length > 0 && (
                                <div className="text-xs text-gray-300 mb-2 space-y-1">
                                  <p className="font-medium text-[#FFFAC3]">Includes:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {pkg.includes.slice(0, 4).map((item, idx) => (
                                      <span key={idx} className="bg-gray-700/50 px-2 py-0.5 rounded text-xs">
                                        {item}
                                      </span>
                                    ))}
                                    {pkg.includes.length > 4 && (
                                      <span className="text-gray-400 text-xs">+{pkg.includes.length - 4} more</span>
                                    )}
                                  </div>
                                </div>
                              )}
                              {/* Highlight key activities */}
                              {pkg.duration && (
                                <p className="text-xs text-gray-400 italic">
                                  {pkg.duration === 2 
                                    ? 'Includes bonfire and lunch' 
                                    : `${pkg.duration} days with bonfire nights, meals, and guided tours`}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center justify-between pt-2 border-t border-gray-700/50">
                              <div>
                                <p className="text-lg font-bold text-[#FFFAC3]">
                                  PKR {Number(pkg.price).toLocaleString()}
                                </p>
                                {pkg.rating > 0 && (
                                  <p className="text-xs text-gray-400 mt-1">
                                    ⭐ {pkg.rating.toFixed(1)} rating
                                  </p>
                                )}
                              </div>
                              <div className="flex space-x-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleShowDetails(pkg)
                                  }}
                                  className="bg-gray-700 text-white px-3 py-2 rounded-lg text-xs font-medium hover:bg-gray-600 transition-all"
                                >
                                  Details
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleBookNow(pkg)
                                  }}
                                  className="bg-[#566614] text-white px-3 py-2 rounded-lg text-xs font-medium hover:bg-[#6E6B40] transition-all"
                                >
                                  Book Now
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )})}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading Indicator - Dark Style */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 max-w-xs border border-gray-700/50">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-[#566614] rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-[#566614] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-[#566614] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <p className="text-xs text-gray-400 mt-2">AI is thinking...</p>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form at Bottom - Always Accessible */}
      <div className="bg-gray-800/50 border-t border-gray-700/50 p-4 flex-shrink-0">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about packages, destinations, prices..."
              className="w-full px-4 py-3 pr-12 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#566614]/50 focus:border-[#566614]/50 transition-all"
              disabled={loading}
            />
            {input && (
              <button
                type="button"
                onClick={() => setInput('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <motion.button
            type="submit"
            disabled={loading || !input.trim()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-[#566614] to-[#6E6B40] text-white px-5 py-3 rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center justify-center min-w-[60px]"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </motion.button>
        </form>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Try: "I want to visit Hunza for 2 days under 20K" or "Show me Swat packages"
        </p>
      </div>

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
            // Optionally refresh packages or show success message
          }}
        />
      )}

      {/* Package Details Modal */}
      {showDetailsModal && (
        <PackageDetailsModal
          packageId={selectedPackageId}
          onClose={() => {
            setShowDetailsModal(false)
            setSelectedPackageId(null)
          }}
          onBook={(pkg) => {
            setShowDetailsModal(false)
            setSelectedPackageId(null)
            handleBookNow(pkg)
          }}
        />
      )}
    </div>
  )
}
