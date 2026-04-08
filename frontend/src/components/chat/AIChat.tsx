import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { aiApi, packageApi } from '../../services/api'
import ChatMessage from './ChatMessage'
import TravelerAiAvatar from './TravelerAiAvatar'
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
  /** When set, header shows a close control (floating chat widget). */
  onClose?: () => void
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

export default function AIChat({ onPackageFilter, onPackageSelect, onClose }: AIChatProps) {
  const { isAuthenticated, user } = useAuthStore()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        "👋 Hi — I'm your AI travel agent for Pakistan. Ask in your own words (place, budget, days) or tap a suggestion below.",
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | undefined>()
  /** Scroll only this element — never use scrollIntoView (it scrolls the whole page). */
  const messagesScrollRef = useRef<HTMLDivElement>(null)
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

  const scrollChatPanelToBottom = (behavior: ScrollBehavior = 'smooth') => {
    const el = messagesScrollRef.current
    if (!el) return
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.scrollTo({ top: el.scrollHeight, behavior })
      })
    })
  }

  useEffect(() => {
    if (!shouldScroll) return
    scrollChatPanelToBottom('smooth')
    setShouldScroll(false)
  }, [messages, shouldScroll])

  /** Keep "AI is analyzing" in view without moving the browser window */
  useEffect(() => {
    if (!loading) return
    scrollChatPanelToBottom('smooth')
  }, [loading])

  useEffect(() => {
    const messagesContainer = messagesScrollRef.current
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
    if (loading) return
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
          content: response.data.response?.trim() || 'Here are some packages that might match.',
          recommendations: recommendations,
        }
        setMessages((prev) => [...prev, assistantMessage])
        setShouldScroll(true)
        setAiAvailable(true)
        if (response.data.conversationId) {
          setConversationId(response.data.conversationId)
        }

        if (onPackageFilter && userInput) {
          const filters: Record<string, string> = {}
          if (userInput.toLowerCase().includes('hunza')) filters.destination = 'Hunza'
          if (userInput.toLowerCase().includes('swat')) filters.destination = 'Swat'
          if (userInput.toLowerCase().includes('naran')) filters.destination = 'Naran'
          if (userInput.toLowerCase().includes('skardu')) filters.destination = 'Skardu'

          const priceMatch = userInput.match(/(\d+)k|(\d+)\s*k|under\s*(\d+)/i)
          if (priceMatch) {
            const price = parseInt(priceMatch[1] || priceMatch[2] || priceMatch[3] || '0', 10) * 1000
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
      } else {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content:
            'The assistant returned an unexpected response. Please try again or use Browse to search packages.',
        }
        setMessages((prev) => [...prev, assistantMessage])
        setShouldScroll(true)
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
      } else if (status === 403) {
        errorContent =
          'Your account cannot use this assistant here. Log in as a tourist, or continue with Browse.'
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
        
        <div className="relative z-10 flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 400, damping: 18 }}
            className="min-w-0 flex-1"
          >
            <TravelerAiAvatar
              size="md"
              variant="panel"
              title="AI Assistant"
              subtitle="RAAHI · travel guide"
              className="max-w-[min(100%,14rem)] sm:max-w-none"
            />
            <div className="mt-1.5 flex items-center gap-1.5 pl-0.5">
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
          </motion.div>
        </div>
        
        <div className="relative z-10 flex flex-shrink-0 items-center gap-1.5 sm:gap-2">
          {!onClose && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="hidden text-right sm:block"
            >
              <div className="text-[10px] font-medium uppercase tracking-wider text-gray-500">RAAHI</div>
              <div className="text-xs font-semibold text-[#FFFAC3]/90">Travel AI</div>
            </motion.div>
          )}
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="touch-manipulation rounded-xl p-2.5 text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Close assistant"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          ) : null}
        </div>
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
              The status check could not reach the AI engine (it may still respond). You can send a message below to try,
              or use <span className="text-white/90">Browse</span> for packages.
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
                disabled={loading}
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
        ref={messagesScrollRef}
        className="chat-scrollbar chat-scroll-touch min-h-0 flex-1 space-y-5 overflow-y-auto overflow-x-hidden overscroll-y-contain px-3 py-3 sm:space-y-6 sm:px-4 sm:py-4 [overflow-anchor:none]" 
        style={{ 
          scrollbarWidth: 'thin',
          scrollbarColor: '#566614 #1f2937',
        }}
      >
        <AnimatePresence mode="popLayout">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            >
              <ChatMessage
                message={message}
                onSelectRecommendation={handleSelectRecommendation}
              />
              
              {/* Compact package rows — sized for the chat column */}
              {message.recommendations && message.recommendations.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12 }}
                  className="mt-3 max-w-full space-y-2"
                >
                  <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#FFFAC3]/90">
                    <svg className="h-3.5 w-3.5 shrink-0 text-[#FFFAC3]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {message.recommendations.length} match{message.recommendations.length !== 1 ? 'es' : ''}
                  </p>
                  <div className="flex flex-col gap-2">
                    {message.recommendations.map((pkg, idx) => (
                      <motion.div
                        key={pkg.id || `pkg-${idx}`}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: idx * 0.05 }}
                        className="overflow-hidden rounded-xl border border-gray-700/60 bg-[#1a1d24]/95 shadow-md"
                      >
                        <div className="flex gap-2.5 p-2 sm:gap-3 sm:p-2.5">
                          <div className="relative h-[4.5rem] w-[4.5rem] shrink-0 overflow-hidden rounded-lg bg-gray-800 sm:h-[5rem] sm:w-[5rem]">
                            {pkg.images && pkg.images.length > 0 ? (
                              <img
                                src={pkg.images[0]}
                                alt=""
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  ;(e.target as HTMLImageElement).src =
                                    'https://images.pexels.com/photos/1578750/pexels-photo-1578750.jpeg?w=400&h=400&fit=crop'
                                }}
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#566614] to-[#6E6B40] text-[10px] font-bold text-white">
                                {pkg.destination?.slice(0, 3) || 'PKG'}
                              </div>
                            )}
                            {pkg.matchScore != null && (
                              <span className="absolute bottom-0.5 right-0.5 rounded bg-black/70 px-1 py-px text-[9px] font-bold text-[#FFFAC3]">
                                {pkg.matchScore}%
                              </span>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="line-clamp-2 text-left text-[13px] font-semibold leading-snug text-white sm:text-sm">
                              {pkg.title}
                            </h4>
                            <p className="mt-0.5 line-clamp-1 text-[10px] text-gray-400 sm:text-[11px]">
                              {pkg.destination} · {pkg.duration}d
                              {pkg.includes && pkg.includes.length > 0
                                ? ` · ${pkg.includes.slice(0, 2).join(', ')}${pkg.includes.length > 2 ? '…' : ''}`
                                : ''}
                            </p>
                            <p className="mt-1 text-[13px] font-bold tabular-nums text-[#FFFAC3] sm:text-sm">
                              PKR {Number(pkg.price).toLocaleString()}
                              {pkg.rating > 0 && (
                                <span className="ml-1.5 text-[10px] font-normal text-gray-500">
                                  ★ {pkg.rating.toFixed(1)}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5 border-t border-gray-700/50 p-2 pt-1.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleShowDetails(pkg)
                            }}
                            className="touch-manipulation rounded-lg border border-gray-600/70 bg-gray-800/90 py-2 text-center text-[11px] font-semibold text-gray-100 transition-colors hover:bg-gray-700/90"
                          >
                            Details
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleBookNow(pkg)
                            }}
                            className="touch-manipulation rounded-lg bg-gradient-to-r from-[#566614] to-[#6E6B40] py-2 text-center text-[11px] font-semibold text-white transition-opacity hover:opacity-95"
                          >
                            Book
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing row — app-style: avatar + bubble */}
        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 32 }}
            className="flex w-full items-end gap-2"
          >
            <div className="mb-1 shrink-0">
              <TravelerAiAvatar size="sm" />
            </div>
            <div className="flex max-w-[min(16rem,85%)] flex-col gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wide text-[#FFFAC3]/80">AI guide</span>
              <div className="rounded-[1.35rem] rounded-bl-md border border-white/[0.07] bg-[#2a2d36]/95 px-4 py-3 shadow-inner backdrop-blur-sm">
                <div className="flex items-center gap-1">
                  <motion.span
                    className="inline-block h-2 w-2 rounded-full bg-emerald-400/90"
                    animate={{ y: [0, -5, 0], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 0.55, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  <motion.span
                    className="inline-block h-2 w-2 rounded-full bg-emerald-400/90"
                    animate={{ y: [0, -5, 0], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 0.55, repeat: Infinity, ease: 'easeInOut', delay: 0.12 }}
                  />
                  <motion.span
                    className="inline-block h-2 w-2 rounded-full bg-emerald-400/90"
                    animate={{ y: [0, -5, 0], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 0.55, repeat: Infinity, ease: 'easeInOut', delay: 0.24 }}
                  />
                </div>
                <motion.p
                  className="mt-2 text-xs font-medium text-gray-400"
                  animate={{ opacity: [0.65, 1, 0.65] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  Searching trips &amp; places…
                </motion.p>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Input row — same pattern as mobile chat apps (field + round send) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
        className="relative flex-shrink-0 border-t border-white/[0.06] bg-gradient-to-t from-[#0c0e12] via-gray-900/95 to-transparent px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl sm:px-4 sm:pb-[max(1rem,env(safe-area-inset-bottom))] sm:pt-4"
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#566614]/5 to-transparent" />
        
        <form ref={formRef} onSubmit={handleSubmit} className="relative z-10 flex items-end gap-2">
          <div className="group relative min-w-0 flex-1">
            <label htmlFor="raahi-chat-input" className="sr-only">
              Message to travel assistant
            </label>
            <motion.input
              id="raahi-chat-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message… e.g. Hunza under 25k"
              autoComplete="off"
              whileFocus={{ scale: 1.01 }}
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              className="w-full touch-manipulation rounded-[1.35rem] border border-gray-600/80 bg-gray-800/95 px-4 py-3 pr-10 text-base text-white shadow-inner placeholder:text-gray-500 focus:border-[#566614] focus:outline-none focus:ring-2 focus:ring-[#566614]/40"
              disabled={loading}
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
            disabled={loading || !input.trim()}
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
            Tip: close this chat to use filters and the full package list
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

      {/* Package Details Modal — compact + high z-index so it sits above the chat shell */}
      {showDetailsModal && (
        <PackageDetailsModal
          variant="compact"
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
