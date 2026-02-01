import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface FilterState {
  destination: string
  minPrice: string
  maxPrice: string
  duration: string
  minRating: string
}

interface PackageFiltersProps {
  filters: FilterState
  onFilterChange: (filters: FilterState) => void
  onReset: () => void
}

export default function PackageFilters({ filters, onFilterChange, onReset }: PackageFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleChange = (key: keyof FilterState, value: string) => {
    onFilterChange({ ...filters, [key]: value })
  }

  const quickFilters = [
    { label: 'Under 20K', minPrice: '0', maxPrice: '20000' },
    { label: '20K - 50K', minPrice: '20000', maxPrice: '50000' },
    { label: '50K+', minPrice: '50000', maxPrice: '' },
    { label: '2-3 Days', duration: '2' },
    { label: '4-5 Days', duration: '4' },
    { label: '5+ Days', duration: '5' },
  ]

  return (
    <>
      {/* Mobile Filter Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden w-full bg-[#566614] text-white px-4 py-2 rounded-md mb-4 flex items-center justify-between"
      >
        <span>Filters</span>
        <svg
          className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Filter Panel */}
      <AnimatePresence>
        {(isOpen || (typeof window !== 'undefined' && window.innerWidth >= 1024)) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-lg shadow-lg p-6 mb-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold" style={{ fontFamily: 'LEMON MILK, sans-serif' }}>
                Filter Packages
              </h3>
              <button
                onClick={onReset}
                className="text-sm text-[#566614] hover:underline"
              >
                Reset
              </button>
            </div>

            {/* Quick Filters */}
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-2">Quick Filters</p>
              <div className="flex flex-wrap gap-2">
                {quickFilters.map((filter, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      if (filter.minPrice) handleChange('minPrice', filter.minPrice)
                      if (filter.maxPrice) handleChange('maxPrice', filter.maxPrice)
                      if (filter.duration) handleChange('duration', filter.duration)
                    }}
                    className="px-3 py-1 bg-[#FFFAC3] text-[#566614] rounded-full text-sm hover:bg-[#566614] hover:text-white transition-colors"
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Advanced Filters */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Destination
                </label>
                <input
                  type="text"
                  value={filters.destination}
                  onChange={(e) => handleChange('destination', e.target.value)}
                  placeholder="e.g., Hunza, Swat"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#566614]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Price (PKR)
                  </label>
                  <input
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) => handleChange('minPrice', e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#566614]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Price (PKR)
                  </label>
                  <input
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) => handleChange('maxPrice', e.target.value)}
                    placeholder="100000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#566614]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (days)
                </label>
                <input
                  type="number"
                  value={filters.duration}
                  onChange={(e) => handleChange('duration', e.target.value)}
                  placeholder="e.g., 3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#566614]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Rating
                </label>
                <select
                  value={filters.minRating}
                  onChange={(e) => handleChange('minRating', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#566614]"
                >
                  <option value="">Any Rating</option>
                  <option value="4">4+ Stars</option>
                  <option value="3">3+ Stars</option>
                  <option value="2">2+ Stars</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
