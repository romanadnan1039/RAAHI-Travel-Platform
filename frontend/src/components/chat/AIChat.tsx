import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { aiApi, packageApi } from '../../services/api'
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
}

// Modern suggestion chips with emojis
const SUGGESTION_CHIPS = [
  { label: '🏔️ Hunza under 30k', query: 'Show me Hunza packages under 30k' },
  { label: '🏕️ 2 day Swat trip', query: '2 day trip to Swat' },
  { label: '👨‍👩‍👧 Family Murree', query: 'Family package to Murree' },
  { label: '💎 Luxury Skardu', query: 'Luxury Skardu tour' },
  { label: '💰 Budget Naran', query: 'Budget Naran packages' },
  { label: '🌙 Weekend getaway', query: 'Weekend packages' },
]

export default function AIChat({ onPackageFilter }: AIChatProps) {
  const { isAuthenticated, user } = useAuthStore()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "👋 Hello! I'm your RAAHI AI travel assistant. I can help you find perfect packages in seconds! Try the suggestions below or ask me anything about travel in Pakistan.",
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
  const [showSuggestions, setShowSuggestions] = useState(true)

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

  // Handle suggestion chip click
  const handleSuggestionClick = (query: string) => {
    setInput(query)
    setShowSuggestions(false)
    // Auto-submit after a tiny delay for smooth animation
    setTimeout(() => {
      const form = document.querySelector('form')
      if (form) {
        form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))
      }
    }, 100)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    setShowSuggestions(false) // Hide suggestions after first query

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
    } catch (error: any) {
      console.error('Chat error:', error)
      
      let errorContent = 'Sorry, I encountered an error. Please try again.'
      
      // Provide more specific error messages
      if (error.response?.status === 503) {
        errorContent = '🔧 AI service is currently unavailable. Our team is working on it. Please try again in a few moments.'
      } else if (error.response?.status === 401) {
        errorContent = '🔒 Please log in to use the AI assistant.'
      } else if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
        errorContent = '📡 Connection error. Please check your internet connection and try again.'
      } else if (error.response?.data?.error?.message) {
        errorContent = `⚠️ ${error.response.data.error.message}`
      }
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: errorContent,
      }
      setMessages((prev) => [...prev, errorMessage])
      setShouldScroll(true)
    } finally {
      setLoading(false)
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
    <div className="max-w-md mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-xl h-full min-h-[600px] flex flex-col overflow-hidden">
      {/* WhatsApp-Style Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-[#566614] to-[#6E6B40] px-4 py-3 flex items-center space-x-3 flex-shrink-0 shadow-md"
      >
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg"
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </motion.div>
        <div className="flex-1">
          <h2 className="text-white font-semibold text-base">RAAHI AI Assistant</h2>
          <div className="flex items-center space-x-1.5">
            <motion.div 
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1.5 h-1.5 bg-green-300 rounded-full"
            />
            <span className="text-xs text-white/80">Online • Fast replies</span>
          </div>
        </div>
      </motion.div>

      {/* Quick Suggestion Chips */}
      {showSuggestions && messages.length === 1 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="px-4 pt-3 pb-2 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700/50"
        >
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">
            Quick suggestions:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTION_CHIPS.map((chip, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSuggestionClick(chip.query)}
                className="bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 px-3 py-1.5 rounded-full text-xs font-medium border border-gray-200 dark:border-gray-600 transition-colors shadow-sm"
              >
                {chip.label}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Messages Area - WhatsApp Style */}
      <div 
        className="flex-1 overflow-y-auto px-4 py-4 bg-gray-50 dark:bg-gray-900" 
        style={{ 
          scrollbarWidth: 'thin',
          scrollbarColor: '#9ca3af #f3f4f6',
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
        }}
      >
        <AnimatePresence mode="popLayout">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`flex mb-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {/* WhatsApp-Style Message Bubble */}
              <div className={`max-w-[85%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                <div
                  className={`rounded-lg px-4 py-2.5 shadow-md ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-[#566614] to-[#6E6B40] text-white rounded-br-sm'
                      : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-bl-sm border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
                  <div className={`text-xs mt-1.5 ${message.role === 'user' ? 'text-white/70' : 'text-gray-500'} text-right`}>
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
              
              {/* Package Recommendations - Compact Cards */}
              {message.recommendations && message.recommendations.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="mt-2 mb-3 max-w-[85%]"
                >
                  <div className="flex items-center gap-1.5 mb-2">
                    <svg className="w-3.5 h-3.5 text-[#566614]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                      {message.recommendations.length} packages found
                    </p>
                  </div>
                  <div className="space-y-2">
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
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2, delay: idx * 0.05 }}
                          whileHover={{ scale: 1.01 }}
                          className="cursor-pointer"
                        >
                          <div
                            className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-200 dark:border-gray-700 hover:border-[#566614] dark:hover:border-[#6E6B40] transition-all shadow-sm hover:shadow-md overflow-hidden"
                          >
                            {/* Package Image */}
                            {(pkg.images && pkg.images.length > 0) ? (
                              <div className="relative overflow-hidden rounded-lg mb-2">
                                <img
                                  src={pkg.images[0]}
                                  alt={pkg.title}
                                  className="w-full h-32 object-cover"
                                  onError={(e) => {
                                    ;(e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/1578750/pexels-photo-1578750.jpeg?w=800&h=600&fit=crop'
                                  }}
                                />
                                {pkg.matchScore && (
                                  <div className="absolute top-2 right-2 bg-gradient-to-r from-[#566614] to-[#6E6B40] text-white px-2 py-0.5 rounded-full text-xs font-bold">
                                    {pkg.matchScore}% Match
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="w-full h-32 bg-gradient-to-br from-[#566614] to-[#6E6B40] rounded-lg mb-2 flex items-center justify-center">
                                <span className="text-white text-lg font-bold">{pkg.destination}</span>
                              </div>
                            )}
                            {/* Package Info */}
                            <div>
                              <h4 className="font-semibold text-gray-800 dark:text-white text-sm mb-1.5">{pkg.title}</h4>
                              <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400 mb-2">
                                <span className="flex items-center gap-1">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  </svg>
                                  {pkg.destination}
                                </span>
                                <span className="flex items-center gap-1">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  {pkg.duration} days
                                </span>
                              </div>
                              {/* Includes - Compact */}
                              {pkg.includes && pkg.includes.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-2">
                                  {pkg.includes.slice(0, 2).map((item, idx) => (
                                    <span
                                      key={idx}
                                      className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-xs text-gray-600 dark:text-gray-300"
                                    >
                                      ✓ {item}
                                    </span>
                                  ))}
                                  {pkg.includes.length > 2 && (
                                    <span className="text-gray-500 text-xs self-center">+{pkg.includes.length - 2}</span>
                                  )}
                                </div>
                              )}
                            </div>
                            {/* Price and Actions - Compact */}
                            <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                              <div>
                                <p className="text-lg font-bold text-[#566614] dark:text-[#FFFAC3]">
                                  PKR {Number(pkg.price).toLocaleString()}
                                </p>
                                {pkg.rating > 0 && (
                                  <div className="flex items-center gap-1">
                                    <span className="text-yellow-500 text-sm">★</span>
                                    <span className="text-xs text-gray-600 dark:text-gray-400">{pkg.rating.toFixed(1)}</span>
                                  </div>
                                )}
                              </div>
                              <div className="flex gap-1.5">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleShowDetails(pkg)
                                  }}
                                  className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                                >
                                  Details
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleBookNow(pkg)
                                  }}
                                  className="bg-gradient-to-r from-[#566614] to-[#6E6B40] text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:shadow-md transition-shadow"
                                >
                                  Book →
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                    )})}
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading Indicator - WhatsApp Style */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex justify-start mb-3"
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg rounded-bl-sm px-4 py-3 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex space-x-1.5">
                <motion.div 
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity }}
                  className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"
                />
                <motion.div 
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
                  className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"
                />
                <motion.div 
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
                  className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"
                />
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* WhatsApp-Style Input */}
      <div className="bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-3 flex-shrink-0">
        <form onSubmit={handleSubmit} className="flex gap-2 items-center">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="w-full px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-full text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-[#566614] dark:focus:border-[#6E6B40] transition-colors text-sm"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-gradient-to-r from-[#566614] to-[#6E6B40] text-white p-2.5 rounded-full hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </form>
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
