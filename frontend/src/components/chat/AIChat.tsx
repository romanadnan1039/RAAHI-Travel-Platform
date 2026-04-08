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

// Modern suggestion chips with emojis
const SUGGESTION_CHIPS = [
  { label: '🏔️ Hunza under 30k', query: 'Show me Hunza packages under 30k' },
  { label: '🏕️ 2 day Swat trip', query: '2 day trip to Swat' },
  { label: '👨‍👩‍👧 Family Murree', query: 'Family package to Murree' },
  { label: '💎 Luxury Skardu', query: 'Luxury Skardu tour' },
  { label: '💰 Budget Naran', query: 'Budget Naran packages' },
  { label: '🌙 Weekend getaway', query: 'Weekend packages' },
]

export default function AIChat({ onPackageFilter, onPackageSelect }: AIChatProps) {
  const { isAuthenticated, user } = useAuthStore()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        "👋 Hi! Ask in your own words — e.g. a place, budget, or number of days. Or tap a quick suggestion below.",
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | undefined>()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const [shouldScroll, setShouldScroll] = useState(false)
  const isUserScrolling = useRef(false)
  const scrollTimeoutRef = useRef<number | undefined>()
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(true)
  /** null = checking; true/false from GET /api/ai/status */
  const [aiAvailable, setAiAvailable] = useState<boolean | null>(null)

  useEffect(() => {
    let cancelled = false
    aiApi
      .getStatus()
      .then((r) => {
        if (!cancelled && r.success && r.data) setAiAvailable(!!r.data.available)
      })
      .catch(() => {
        if (!cancelled) setAiAvailable(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const recheckAiStatus = () => {
    setAiAvailable(null)
    aiApi
      .getStatus()
      .then((r) => {
        if (r.success && r.data) setAiAvailable(!!r.data.available)
        else setAiAvailable(false)
      })
      .catch(() => setAiAvailable(false))
  }

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
    if (aiAvailable === false || loading) return
    setInput(query)
    setShowSuggestions(false)
    setTimeout(() => {
      formRef.current?.requestSubmit()
    }, 50)
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
      if (!response.success) {
        const msg =
          response.error?.message ||
          'The assistant could not complete this request. Please try again or use Browse for packages.'
        if (response.error?.code === 'SERVICE_UNAVAILABLE') setAiAvailable(false)
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: msg,
        }
        setMessages((prev) => [...prev, assistantMessage])
        setShouldScroll(true)
        return
      }
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
        setAiAvailable(true)
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
      
      let errorContent = 'Sorry, something went wrong. Please try again.'
      
      const status = error.response?.status
      const apiMsg = error.response?.data?.error?.message as string | undefined

      if (status === 503 || status === 502) {
        errorContent =
          'The AI assistant is temporarily unavailable. You can still browse all trips under Browse, or tap Retry below when the service is back.'
        setAiAvailable(false)
      } else if (status === 401) {
        errorContent = 'Please sign in as a tourist to use the assistant.'
      } else if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
        errorContent =
          'No connection to the server. Check your network, confirm the app is running, then try again.'
        setAiAvailable(false)
      } else if (apiMsg) {
        errorContent = apiMsg
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
    <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden rounded-[inherit] border border-white/[0.07] bg-gradient-to-b from-[#14161c] via-[#101218] to-[#0c0e12] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] backdrop-blur-xl">
      {/* Modern Gradient Header with Glass Effect */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative flex flex-shrink-0 items-center justify-between border-b border-white/[0.06] bg-gradient-to-r from-[#566614]/15 via-[#3d4118]/20 to-[#566614]/15 px-3 py-2.5 backdrop-blur-md sm:px-4 sm:py-3"
      >
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#566614]/10 to-[#6E6B40]/10 animate-gradient-x"></div>
        
        <div className="relative z-10 flex min-w-0 items-center gap-2.5 sm:gap-4">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#566614] to-[#6E6B40] shadow-md shadow-[#566614]/20 sm:h-11 sm:w-11"
          >
            <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </motion.div>
          <div className="min-w-0">
            <h2 className="truncate text-sm font-bold leading-tight text-white sm:text-base" style={{ fontFamily: 'LEMON MILK, sans-serif' }}>
              <span className="sm:hidden">Travel assistant</span>
              <span className="hidden sm:inline">RAAHI AI Assistant</span>
            </h2>
            <div className="mt-0.5 flex items-center gap-1.5">
              {aiAvailable === null ? (
                <>
                  <span className="h-1.5 w-1.5 flex-shrink-0 animate-pulse rounded-full bg-gray-500" />
                  <span className="text-[11px] text-gray-500">Checking…</span>
                </>
              ) : aiAvailable ? (
                <>
                  <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                  <span className="text-[11px] text-gray-400">Ready</span>
                </>
              ) : (
                <>
                  <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-400" />
                  <span className="text-[11px] text-amber-200/90">Assistant offline</span>
                </>
              )}
            </div>
          </div>
        </div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="relative z-10 hidden flex-shrink-0 text-right sm:block"
        >
          <div className="text-[10px] font-medium uppercase tracking-wider text-gray-500">RAAHI</div>
          <div className="text-xs font-semibold text-[#FFFAC3]/90">Travel AI</div>
        </motion.div>
      </motion.div>

      {aiAvailable === false && (
        <div className="flex flex-shrink-0 items-start gap-2 border-b border-amber-500/20 bg-amber-950/40 px-3 py-2.5 sm:px-4">
          <span className="mt-0.5 text-amber-400" aria-hidden>
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 10-2 0v2a1 1 0 102 0v-2zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium leading-snug text-amber-100/95">
              The AI engine is not reachable right now. Start the AI agent service, or use{' '}
              <span className="text-white/90">Browse</span> to explore packages.
            </p>
            <button
              type="button"
              onClick={recheckAiStatus}
              className="mt-1.5 touch-manipulation text-xs font-semibold text-amber-300 underline decoration-amber-500/50 underline-offset-2 hover:text-amber-200"
            >
              Retry connection
            </button>
          </div>
        </div>
      )}

      {/* Suggestion Chips - Appears at top when no messages */}
      {showSuggestions && messages.length === 1 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-b from-gray-900/50 to-transparent px-3 pb-3 pt-2 sm:px-5 sm:pt-3"
        >
          <p className="mb-2 text-xs font-medium text-gray-300 sm:text-sm">
            Quick picks <span className="font-normal text-gray-500">— tap one</span>
          </p>
          <div className="scrollbar-hide -mx-1 flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-1 pb-1 sm:flex-wrap sm:gap-2 sm:overflow-visible">
            {SUGGESTION_CHIPS.map((chip, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => handleSuggestionClick(chip.query)}
                disabled={aiAvailable === false || loading}
                className="group relative min-h-[44px] shrink-0 snap-center touch-manipulation rounded-2xl border border-gray-600/60 bg-gray-800/90 px-3.5 py-2.5 text-left text-sm font-medium leading-snug text-white shadow-md transition-all active:border-[#566614]/80 active:bg-[#566614]/20 disabled:cursor-not-allowed disabled:opacity-40 sm:min-h-0 sm:px-4 sm:py-2.5 sm:text-sm"
              >
                <span className="relative z-10">{chip.label}</span>
                <div className="absolute inset-0 bg-gradient-to-r from-[#566614]/0 to-[#6E6B40]/0 group-hover:from-[#566614]/10 group-hover:to-[#6E6B40]/10 rounded-xl transition-all" />
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Messages Area - Modern Scrollable */}
      <div 
        className="chat-scrollbar chat-scroll-touch min-h-0 flex-1 space-y-4 overflow-y-auto overflow-x-hidden px-3 py-3 sm:px-4 sm:py-4" 
        style={{ 
          scrollbarWidth: 'thin',
          scrollbarColor: '#566614 #1f2937',
        }}
      >
        <AnimatePresence mode="popLayout">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
            >
              <ChatMessage
                message={message}
                onSelectRecommendation={handleSelectRecommendation}
              />
              
              {/* Show Package Cards for Recommendations with Modern Styling */}
              {message.recommendations && message.recommendations.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mt-6 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FFFAC3] to-[#6E6B40] uppercase tracking-wider flex items-center gap-2">
                      <svg className="w-4 h-4 text-[#FFFAC3]" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {message.recommendations.length} Top Matches
                    </p>
                    <span className="hidden text-xs text-gray-500 sm:inline">Scroll to see all →</span>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {message.recommendations.map((pkg, idx) => {
                      return (
                        <motion.div
                          key={pkg.id || `pkg-${idx}`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: idx * 0.1 }}
                          whileHover={{ scale: 1.02, y: -4 }}
                          className="group cursor-pointer"
                        >
                          <div
                            className="relative overflow-hidden rounded-2xl border border-gray-700/50 bg-gradient-to-br from-gray-800/90 to-gray-900/90 p-4 shadow-xl backdrop-blur-xl transition-all hover:border-[#566614]/70 hover:shadow-2xl hover:shadow-[#566614]/20 sm:p-5"
                          >
                            {/* Animated gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-br from-[#566614]/0 to-[#6E6B40]/0 group-hover:from-[#566614]/10 group-hover:to-[#6E6B40]/10 transition-all duration-500" />
                            
                            {/* Content */}
                            <div className="relative z-10">
                            {(pkg.images && pkg.images.length > 0) ? (
                              <div className="relative overflow-hidden rounded-xl mb-4 group/img">
                                <img
                                  src={pkg.images[0]}
                                  alt={pkg.title}
                                  className="h-36 w-full object-cover transition-transform duration-700 group-hover/img:scale-110 sm:h-44"
                                  onError={(e) => {
                                    console.error(`Image failed to load for ${pkg.title}:`, pkg.images[0])
                                    ;(e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/1578750/pexels-photo-1578750.jpeg?w=800&h=600&fit=crop'
                                  }}
                                />
                                {/* Match score badge */}
                                {pkg.matchScore && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.3 + idx * 0.1 }}
                                    className="absolute top-3 right-3 bg-gradient-to-r from-[#566614] to-[#6E6B40] text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm flex items-center gap-1"
                                  >
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                    {pkg.matchScore}% Match
                                  </motion.div>
                                )}
                              </div>
                            ) : (
                              <div className="relative mb-4 flex h-36 w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[#566614] via-[#6E6B40] to-[#566614] sm:h-44">
                                <div className="absolute inset-0 bg-black/20" />
                                <span className="text-white text-xl font-bold relative z-10">{pkg.destination || 'Package'}</span>
                              </div>
                            )}
                          <div className="space-y-3">
                            <div>
                              <h4 className="font-bold text-white text-base mb-2 group-hover:text-[#FFFAC3] transition-colors">{pkg.title}</h4>
                              <div className="flex items-center flex-wrap gap-2 text-xs text-gray-400 mb-3">
                                <span className="flex items-center gap-1 bg-gray-700/50 px-2 py-1 rounded-lg">
                                  <svg className="w-3.5 h-3.5 text-[#FFFAC3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  </svg>
                                  {pkg.destination}
                                </span>
                                <span className="flex items-center gap-1 bg-gray-700/50 px-2 py-1 rounded-lg">
                                  <svg className="w-3.5 h-3.5 text-[#FFFAC3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  {pkg.duration} days
                                </span>
                              </div>
                              {/* Package Includes with Icons */}
                              {pkg.includes && pkg.includes.length > 0 && (
                                <div className="space-y-2">
                                  <p className="text-xs font-bold text-[#FFFAC3] flex items-center gap-1">
                                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    What's Included:
                                  </p>
                                  <div className="flex flex-wrap gap-1.5">
                                    {pkg.includes.slice(0, 3).map((item, idx) => (
                                      <motion.span
                                        key={idx}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.4 + idx * 0.1 }}
                                        className="bg-gradient-to-r from-gray-700/70 to-gray-600/70 px-2.5 py-1 rounded-lg text-xs text-gray-200 border border-gray-600/30"
                                      >
                                        ✓ {item}
                                      </motion.span>
                                    ))}
                                    {pkg.includes.length > 3 && (
                                      <span className="text-gray-400 text-xs self-center font-medium">+{pkg.includes.length - 3} more</span>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                            </div>
                            
                            {/* Price and Actions */}
                            <div className="relative z-10 flex flex-col gap-3 border-t border-gray-700/30 pt-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                              <div className="min-w-0">
                                <div className="flex items-baseline gap-2">
                                  <p className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#FFFAC3] to-[#6E6B40] sm:text-2xl">
                                    PKR {Number(pkg.price).toLocaleString()}
                                  </p>
                                </div>
                                {pkg.rating > 0 && (
                                  <div className="mt-1 flex items-center gap-1">
                                    <div className="flex">
                                      {[...Array(5)].map((_, i) => (
                                        <svg
                                          key={i}
                                          className={`h-3 w-3 ${i < Math.floor(pkg.rating) ? 'text-yellow-400' : 'text-gray-600'}`}
                                          fill="currentColor"
                                          viewBox="0 0 20 20"
                                        >
                                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                      ))}
                                    </div>
                                    <span className="text-xs font-medium text-gray-400">{pkg.rating.toFixed(1)}</span>
                                  </div>
                                )}
                              </div>
                              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:justify-end">
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleShowDetails(pkg)
                                  }}
                                  className="min-h-[44px] touch-manipulation rounded-xl border border-gray-600/50 bg-gray-700/80 px-4 py-2.5 text-xs font-bold text-white shadow-lg backdrop-blur-sm transition-all hover:bg-gray-600/80 sm:min-h-0"
                                >
                                  Details
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleBookNow(pkg)
                                  }}
                                  className="min-h-[44px] touch-manipulation rounded-xl bg-gradient-to-r from-[#566614] to-[#6E6B40] px-4 py-2.5 text-xs font-bold text-white transition-all hover:shadow-lg hover:shadow-[#566614]/30 sm:min-h-0"
                                >
                                  Book Now →
                                </motion.button>
                              </div>
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

        {/* Modern Loading Indicator with Animation */}
        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex justify-start"
          >
            <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-2xl p-5 max-w-xs border border-[#566614]/30 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="flex space-x-1.5">
                  <motion.div 
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity }}
                    className="w-2.5 h-2.5 bg-gradient-to-r from-[#566614] to-[#6E6B40] rounded-full"
                  />
                  <motion.div 
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.1 }}
                    className="w-2.5 h-2.5 bg-gradient-to-r from-[#566614] to-[#6E6B40] rounded-full"
                  />
                  <motion.div 
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                    className="w-2.5 h-2.5 bg-gradient-to-r from-[#566614] to-[#6E6B40] rounded-full"
                  />
                </div>
                <p className="text-sm text-gray-300 font-medium">AI is analyzing...</p>
              </div>
              <div className="mt-3 h-1 bg-gray-700/50 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#566614] to-[#6E6B40]"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input row — same pattern as mobile chat apps (field + round send) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative flex-shrink-0 border-t border-white/[0.06] bg-gradient-to-t from-[#0c0e12] via-gray-900/95 to-transparent px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl sm:px-4 sm:pb-[max(1rem,env(safe-area-inset-bottom))] sm:pt-4"
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#566614]/5 to-transparent" />
        
        <form ref={formRef} onSubmit={handleSubmit} className="relative z-10 flex items-end gap-2">
          <div className="group relative min-w-0 flex-1">
            <label htmlFor="raahi-chat-input" className="sr-only">
              Message to travel assistant
            </label>
            <input
              id="raahi-chat-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message… e.g. Hunza under 25k"
              autoComplete="off"
              className="w-full touch-manipulation rounded-[1.35rem] border border-gray-600/80 bg-gray-800/95 px-4 py-3 pr-10 text-base text-white shadow-inner placeholder:text-gray-500 focus:border-[#566614] focus:outline-none focus:ring-2 focus:ring-[#566614]/40"
              disabled={loading || aiAvailable === false}
              enterKeyHint="send"
            />
            {input ? (
              <button
                type="button"
                onClick={() => setInput('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-gray-400 hover:bg-gray-700/60 hover:text-white"
                aria-label="Clear message"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            ) : null}
          </div>
          <motion.button
            type="submit"
            disabled={loading || !input.trim() || aiAvailable === false}
            whileTap={{ scale: 0.95 }}
            aria-label="Send message"
            className="flex h-12 w-12 flex-shrink-0 touch-manipulation items-center justify-center rounded-full bg-gradient-to-br from-[#566614] to-[#6E6B40] text-white shadow-lg transition-all hover:shadow-[#566614]/40 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <svg className="h-6 w-6 -translate-x-0.5 translate-y-0.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            )}
          </motion.button>
        </form>
        {!(showSuggestions && messages.length === 1) && (
          <p className="relative z-10 mt-2 text-center text-[11px] text-gray-500">
            Tip: switch to <span className="text-gray-400">Browse</span> above to see all packages
          </p>
        )}
      </motion.div>

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
