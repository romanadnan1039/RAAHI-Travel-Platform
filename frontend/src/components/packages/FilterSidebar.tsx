import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface FilterState {
  destination: string
  minPrice: string
  maxPrice: string
  duration: string
  minRating: string
  sortBy: string
  travelType: string
}

interface FilterSidebarProps {
  filters: FilterState
  onFilterChange: (filters: FilterState) => void
  onReset: () => void
  packageCount?: number
}

const DESTINATIONS = [
  'Hunza', 'Swat', 'Naran-Kaghan', 'Skardu', 'Neelum Valley', 
  'Murree', 'Chitral', 'Kumrat Valley', 'Fairy Meadows', 'Kalam'
]

const DURATION_OPTIONS = [
  { label: '1-2 Days', value: '1-2' },
  { label: '3-4 Days', value: '3-4' },
  { label: '5-7 Days', value: '5-7' },
  { label: '8+ Days', value: '8+' },
]

const PRICE_RANGES = [
  { label: 'Under 10K', min: '0', max: '10000' },
  { label: '10K - 20K', min: '10000', max: '20000' },
  { label: '20K - 50K', min: '20000', max: '50000' },
  { label: '50K - 100K', min: '50000', max: '100000' },
  { label: '100K+', min: '100000', max: '' },
]

const TRAVEL_TYPES = [
  { label: 'Budget', value: 'budget' },
  { label: 'Family', value: 'family' },
  { label: 'Adventure', value: 'adventure' },
  { label: 'Luxury', value: 'luxury' },
  { label: 'Weekend', value: 'weekend' },
]

const RATING_OPTIONS = [4.5, 4.0, 3.5, 3.0]

export default function FilterSidebar({ filters, onFilterChange, onReset, packageCount = 0 }: FilterSidebarProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    destination: true,
    price: true,
    duration: true,
    rating: false,
    travelType: false,
  })

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const handleChange = (key: keyof FilterState, value: string) => {
    onFilterChange({ ...filters, [key]: value })
  }

  const handlePriceRange = (min: string, max: string) => {
    onFilterChange({ ...filters, minPrice: min, maxPrice: max })
  }

  const activeFiltersCount = Object.values(filters).filter(v => v && v !== '' && v !== 'relevance').length

  return (
    <div className="w-full lg:w-80 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col h-full overflow-hidden">
      {/* Fixed Header - Upwork Style */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-[#566614] to-[#6E6B40] shadow-md">
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5 text-[#FFFAC3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <h3 className="text-base font-bold text-white" style={{ fontFamily: 'LEMON MILK, sans-serif' }}>
            Filters
          </h3>
          {activeFiltersCount > 0 && (
            <motion.span 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="bg-[#FFFAC3] text-[#566614] text-xs font-bold px-2 py-0.5 rounded-full"
            >
              {activeFiltersCount}
            </motion.span>
          )}
        </div>
        {activeFiltersCount > 0 && (
          <motion.button
            onClick={onReset}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-xs text-[#FFFAC3] hover:text-white font-bold transition-colors underline"
          >
            Clear All
          </motion.button>
        )}
      </div>

      {/* Results Count */}
      {packageCount > 0 && (
        <div className="px-6 py-3 bg-[#FFFAC3]/20 border-b border-gray-100">
          <p className="text-sm text-gray-700">
            <span className="font-bold text-[#566614]">{packageCount}</span> package{packageCount !== 1 ? 's' : ''} available
          </p>
        </div>
      )}
      
      {/* Scrollable Content with Custom Scrollbar */}
      <div 
        className="flex-1 overflow-y-auto px-5 py-4 space-y-4"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#566614 #f3f4f6'
        }}
      >
        {/* Destination */}
        <div className="border-b border-gray-100 pb-4">
          <button
            onClick={() => toggleSection('destination')}
            className="flex items-center justify-between w-full text-left font-bold text-gray-800 text-sm mb-3 hover:text-[#566614] transition-colors"
            style={{ fontFamily: 'LEMON MILK, sans-serif', fontSize: '12px' }}
          >
            <span>DESTINATION</span>
            <motion.svg
              animate={{ rotate: expandedSections.destination ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="w-4 h-4 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </motion.svg>
          </button>

          <AnimatePresence>
            {expandedSections.destination && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{ overflow: 'hidden' }}
              >
                <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin', scrollbarColor: '#566614 #f3f4f6' }}>
                  {DESTINATIONS.map((dest) => (
                    <motion.button
                      key={dest}
                      onClick={() => handleChange('destination', filters.destination === dest ? '' : dest)}
                      whileHover={{ x: 3 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center justify-between ${
                        filters.destination === dest
                          ? 'bg-gradient-to-r from-[#566614] to-[#6E6B40] text-white font-semibold shadow-md'
                          : 'text-gray-700 hover:bg-[#FFFAC3]/40 hover:text-[#566614] font-medium'
                      }`}
                    >
                      <span>{dest}</span>
                      {filters.destination === dest && (
                        <motion.svg 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-4 h-4" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </motion.svg>
                      )}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Price Range */}
        <div className="border-b border-gray-100 pb-4">
          <button
            onClick={() => toggleSection('price')}
            className="flex items-center justify-between w-full text-left font-bold text-gray-800 text-sm mb-3 hover:text-[#566614] transition-colors"
            style={{ fontFamily: 'LEMON MILK, sans-serif', fontSize: '12px' }}
          >
            <span>PRICE RANGE</span>
            <motion.svg
              animate={{ rotate: expandedSections.price ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="w-4 h-4 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </motion.svg>
          </button>

          <AnimatePresence>
            {expandedSections.price && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{ overflow: 'hidden' }}
              >
                <div className="space-y-1.5">
                  {PRICE_RANGES.map((range) => {
                    const isActive = filters.minPrice === range.min && filters.maxPrice === range.max
                    return (
                      <motion.button
                        key={range.label}
                        onClick={() => {
                          if (isActive) {
                            handlePriceRange('', '')
                          } else {
                            handlePriceRange(range.min, range.max)
                          }
                        }}
                        whileHover={{ x: 3 }}
                        whileTap={{ scale: 0.98 }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center justify-between ${
                          isActive
                            ? 'bg-gradient-to-r from-[#566614] to-[#6E6B40] text-white font-semibold shadow-md'
                            : 'text-gray-700 hover:bg-[#FFFAC3]/40 hover:text-[#566614] font-medium'
                        }`}
                      >
                        <span>{range.label}</span>
                        {isActive && (
                          <motion.svg 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-4 h-4" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </motion.svg>
                        )}
                      </motion.button>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Duration */}
        <div className="border-b border-gray-100 pb-4">
          <button
            onClick={() => toggleSection('duration')}
            className="flex items-center justify-between w-full text-left font-bold text-gray-800 text-sm mb-3 hover:text-[#566614] transition-colors"
            style={{ fontFamily: 'LEMON MILK, sans-serif', fontSize: '12px' }}
          >
            <span>DURATION</span>
            <motion.svg
              animate={{ rotate: expandedSections.duration ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="w-4 h-4 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </motion.svg>
          </button>

          <AnimatePresence>
            {expandedSections.duration && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{ overflow: 'hidden' }}
              >
                <div className="space-y-1.5">
                  {DURATION_OPTIONS.map((option) => {
                    const isActive = filters.duration === option.value
                    return (
                      <motion.button
                        key={option.value}
                        onClick={() => handleChange('duration', isActive ? '' : option.value)}
                        whileHover={{ x: 3 }}
                        whileTap={{ scale: 0.98 }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center justify-between ${
                          isActive
                            ? 'bg-gradient-to-r from-[#566614] to-[#6E6B40] text-white font-semibold shadow-md'
                            : 'text-gray-700 hover:bg-[#FFFAC3]/40 hover:text-[#566614] font-medium'
                        }`}
                      >
                        <span>{option.label}</span>
                        {isActive && (
                          <motion.svg 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-4 h-4" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </motion.svg>
                        )}
                      </motion.button>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Travel Type */}
        <div className="border-b border-gray-100 pb-4">
          <button
            onClick={() => toggleSection('travelType')}
            className="flex items-center justify-between w-full text-left font-bold text-gray-800 text-sm mb-3 hover:text-[#566614] transition-colors"
            style={{ fontFamily: 'LEMON MILK, sans-serif', fontSize: '12px' }}
          >
            <span>TRAVEL TYPE</span>
            <motion.svg
              animate={{ rotate: expandedSections.travelType ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="w-4 h-4 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </motion.svg>
          </button>

          <AnimatePresence>
            {expandedSections.travelType && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{ overflow: 'hidden' }}
              >
                <div className="space-y-1.5">
                  {TRAVEL_TYPES.map((type) => {
                    const isActive = filters.travelType === type.value
                    return (
                      <motion.button
                        key={type.value}
                        onClick={() => handleChange('travelType', isActive ? '' : type.value)}
                        whileHover={{ x: 3 }}
                        whileTap={{ scale: 0.98 }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center justify-between ${
                          isActive
                            ? 'bg-gradient-to-r from-[#566614] to-[#6E6B40] text-white font-semibold shadow-md'
                            : 'text-gray-700 hover:bg-[#FFFAC3]/40 hover:text-[#566614] font-medium'
                        }`}
                      >
                        <span>{type.label}</span>
                        {isActive && (
                          <motion.svg 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-4 h-4" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </motion.svg>
                        )}
                      </motion.button>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Rating */}
        <div className="pb-4">
          <button
            onClick={() => toggleSection('rating')}
            className="flex items-center justify-between w-full text-left font-bold text-gray-800 text-sm mb-3 hover:text-[#566614] transition-colors"
            style={{ fontFamily: 'LEMON MILK, sans-serif', fontSize: '12px' }}
          >
            <span>RATING</span>
            <motion.svg
              animate={{ rotate: expandedSections.rating ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="w-4 h-4 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </motion.svg>
          </button>

          <AnimatePresence>
            {expandedSections.rating && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{ overflow: 'hidden' }}
              >
                <div className="space-y-1.5">
                  {RATING_OPTIONS.map((rating) => {
                    const isActive = filters.minRating === rating.toString()
                    return (
                      <motion.button
                        key={rating}
                        onClick={() => handleChange('minRating', isActive ? '' : rating.toString())}
                        whileHover={{ x: 3 }}
                        whileTap={{ scale: 0.98 }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center justify-between ${
                          isActive
                            ? 'bg-gradient-to-r from-[#566614] to-[#6E6B40] text-white font-semibold shadow-md'
                            : 'text-gray-700 hover:bg-[#FFFAC3]/40 hover:text-[#566614] font-medium'
                        }`}
                      >
                        <span className="flex items-center">
                          <svg className="w-4 h-4 text-yellow-400 mr-1 inline" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          {rating}+ & up
                        </span>
                        {isActive && (
                          <motion.svg 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-4 h-4" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </motion.svg>
                        )}
                      </motion.button>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
