import { motion } from 'framer-motion'
import type { Package } from '../../types'
import TravelerAiAvatar from './TravelerAiAvatar'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  recommendations?: Package[]
}

interface ChatMessageProps {
  message: Message
  onSelectRecommendation?: (pkg: Package) => void
}

export default function ChatMessage({ message, onSelectRecommendation: _onSelectRecommendation }: ChatMessageProps) {
  const isUser = message.role === 'user'

  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 420, damping: 30 }}
      className={`flex w-full max-w-full gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end`}
    >
      {!isUser && (
        <div className="mb-1 shrink-0">
          <TravelerAiAvatar size="sm" />
        </div>
      )}

      <div className={`flex min-w-0 flex-1 flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        <span
          className={`mb-0.5 text-[10px] font-bold uppercase tracking-wide ${
            isUser ? 'text-gray-500' : 'text-[#FFFAC3]/90'
          }`}
        >
          {isUser ? 'You' : 'AI guide'}
        </span>
        <div
          className={`rounded-[1.35rem] px-3.5 py-2.5 sm:px-4 sm:py-3 ${
            isUser
              ? 'max-w-[min(22rem,88%)] rounded-br-md bg-gradient-to-br from-[#4b5563] to-[#374151] text-white'
              : 'max-w-[min(19rem,92%)] rounded-bl-md border border-white/[0.08] bg-[#252830]/95 text-gray-100 shadow-lg shadow-black/25 backdrop-blur-sm sm:max-w-[min(20rem,88%)]'
          }`}
          style={{
            boxShadow: isUser
              ? '0 4px 16px rgba(0, 0, 0, 0.35)'
              : '0 6px 24px rgba(0, 0, 0, 0.28)',
          }}
        >
          <p className="break-words text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>

      {isUser && (
        <motion.div
          className="mb-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#566614] to-[#6E6B40] text-xs font-bold text-white shadow-md ring-2 ring-white/10"
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 22 }}
        >
          U
        </motion.div>
      )}
    </motion.div>
  )
}
