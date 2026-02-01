import { motion } from 'framer-motion'

interface LoadingSkeletonProps {
  className?: string
  count?: number
}

export default function LoadingSkeleton({ className = '', count = 1 }: LoadingSkeletonProps) {
  return (
    <>
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.1 }}
          className={`bg-gray-200 rounded animate-pulse ${className}`}
        />
      ))}
    </>
  )
}
