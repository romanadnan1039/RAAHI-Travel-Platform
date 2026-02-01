import { motion } from 'framer-motion'
import PackageCard from './PackageCard'
import type { Package } from '../../types'

interface PackageGridProps {
  packages: Package[]
  loading?: boolean
  onPackageClick?: (pkg: Package) => void
  showAgency?: boolean
  onPackageSelect?: (pkg: Package) => void
}

export default function PackageGrid({ packages, loading, onPackageClick, showAgency = true, onPackageSelect }: PackageGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse flex flex-col">
            <div className="w-full h-56 bg-gray-300"></div>
            <div className="p-5 flex-1 flex flex-col">
              <div className="h-14 bg-gray-300 rounded mb-2"></div>
              <div className="h-6 bg-gray-300 rounded w-2/3 mb-4"></div>
              <div className="flex-1"></div>
              <div className="h-12 bg-gray-300 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (packages.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-16"
      >
        <div className="inline-block p-6 bg-[#FFFAC3]/50 rounded-full mb-6">
          <svg className="w-16 h-16 text-[#566614]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-gray-800 text-xl font-bold mb-2" style={{ fontFamily: 'LEMON MILK, sans-serif' }}>
          No Packages Found
        </p>
        <p className="text-gray-600 text-sm">Try adjusting your search filters or browse all packages</p>
      </motion.div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
      {packages.map((pkg, index) => (
        <motion.div
          key={pkg.id}
          id={`package-${pkg.id}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.5) }}
          className="h-full"
        >
          <PackageCard
            pkg={pkg}
            onClick={() => {
              onPackageClick?.(pkg)
              onPackageSelect?.(pkg)
            }}
            showAgency={showAgency}
          />
        </motion.div>
      ))}
    </div>
  )
}
