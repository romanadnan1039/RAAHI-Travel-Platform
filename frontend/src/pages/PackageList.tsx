import { useEffect, useState } from 'react'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import PackageGrid from '../components/packages/PackageGrid'
import FilterSidebar from '../components/packages/FilterSidebar'
import { packageApi } from '../services/api'
import type { Package } from '../types'

interface FilterState {
  destination: string
  minPrice: string
  maxPrice: string
  duration: string
  minRating: string
  sortBy: string
  travelType: string
}

export default function PackageList() {
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [filters, setFilters] = useState<FilterState>({
    destination: '',
    minPrice: '',
    maxPrice: '',
    duration: '',
    minRating: '',
    sortBy: 'relevance',
    travelType: '',
  })
  const [filteredPackages, setFilteredPackages] = useState<Package[]>([])

  useEffect(() => {
    loadPackages()
  }, [])

  const loadPackages = async () => {
    try {
      setLoading(true)
      setError('')
      const filterParams: any = {}
      if (filters.destination) filterParams.destination = filters.destination
      if (filters.minPrice) filterParams.minPrice = filters.minPrice
      if (filters.maxPrice) filterParams.maxPrice = filters.maxPrice
      if (filters.duration) filterParams.duration = filters.duration
      if (filters.minRating) filterParams.minRating = filters.minRating

      const response = await packageApi.getAll(filterParams)
      if (response.success && response.data) {
        // Handle different response structures
        const responseData = response.data as any
        const packagesData = responseData.data || responseData.packages || response.data || []
        setPackages(Array.isArray(packagesData) ? packagesData : [])
      } else {
        setError('Failed to load packages. Please try again.')
      }
    } catch (error: any) {
      console.error('Failed to load packages:', error)
      setError(error.response?.data?.error?.message || 'Failed to connect to server. Make sure backend is running.')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters)
  }

  const handleResetFilters = () => {
    setFilters({
      destination: '',
      minPrice: '',
      maxPrice: '',
      duration: '',
      minRating: '',
      sortBy: 'relevance',
      travelType: '',
    })
  }

  // Apply filters locally
  useEffect(() => {
    if (packages.length === 0) {
      setFilteredPackages([])
      return
    }

    let filtered = [...packages]

    // Destination
    if (filters.destination && filters.destination.trim() !== '') {
      const dest = filters.destination.toLowerCase().trim()
      filtered = filtered.filter(pkg => pkg.destination.toLowerCase().includes(dest))
    }

    // Price
    if (filters.minPrice && filters.minPrice.trim() !== '') {
      const min = Number(filters.minPrice)
      if (!isNaN(min)) filtered = filtered.filter(pkg => Number(pkg.price) >= min)
    }
    if (filters.maxPrice && filters.maxPrice.trim() !== '') {
      const max = Number(filters.maxPrice)
      if (!isNaN(max)) filtered = filtered.filter(pkg => Number(pkg.price) <= max)
    }

    // Duration
    if (filters.duration && filters.duration.trim() !== '') {
      const dur = filters.duration.trim()
      if (dur.includes('-')) {
        const [min, max] = dur.split('-').map(Number)
        if (!isNaN(min) && !isNaN(max)) {
          filtered = filtered.filter(pkg => pkg.duration >= min && pkg.duration <= max)
        }
      } else if (dur.includes('+')) {
        const min = Number(dur.replace('+', ''))
        if (!isNaN(min)) filtered = filtered.filter(pkg => pkg.duration >= min)
      }
    }

    // Rating
    if (filters.minRating && filters.minRating.trim() !== '') {
      const minRating = Number(filters.minRating)
      if (!isNaN(minRating)) filtered = filtered.filter(pkg => (pkg.rating || 0) >= minRating)
    }

    // Travel Type
    if (filters.travelType && filters.travelType.trim() !== '') {
      const type = filters.travelType.toLowerCase()
      filtered = filtered.filter(pkg => {
        const title = pkg.title.toLowerCase()
        if (type === 'budget') return title.includes('budget') || title.includes('economy')
        if (type === 'family') return title.includes('family')
        if (type === 'adventure') return title.includes('adventure') || title.includes('trekking')
        if (type === 'luxury') return title.includes('luxury') || title.includes('premium')
        if (type === 'weekend') return title.includes('weekend')
        return true
      })
    }

    // Sort
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'price-low':
          filtered.sort((a, b) => Number(a.price) - Number(b.price))
          break
        case 'price-high':
          filtered.sort((a, b) => Number(b.price) - Number(a.price))
          break
        case 'rating':
          filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0))
          break
        case 'duration':
          filtered.sort((a, b) => a.duration - b.duration)
          break
      }
    }

    setFilteredPackages(filtered)
  }, [packages, filters])

  useEffect(() => {
    loadPackages()
  }, [filters])

  return (
    <div className="min-h-screen bg-[#FFFAC3]/30 flex flex-col">
      <Navbar />

      <div className="flex-1 flex flex-col lg:flex-row max-w-[1920px] mx-auto w-full">
        {/* Filter Sidebar - Upwork Style */}
        <div className="w-full lg:w-80 flex-shrink-0 h-[calc(100vh-200px)] lg:h-auto">
          <FilterSidebar
            filters={filters}
            onFilterChange={handleFilterChange}
            onReset={handleResetFilters}
            packageCount={filteredPackages.length}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: 'LEMON MILK, sans-serif' }}>
              Travel Packages
            </h1>
            <p className="text-gray-600">Discover amazing destinations across Pakistan</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
              <button
                onClick={loadPackages}
                className="ml-4 text-red-800 underline hover:text-red-900 font-semibold"
              >
                Retry
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredPackages.length === 0 && packages.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
              <svg className="w-16 h-16 mx-auto mb-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-lg font-semibold text-yellow-800 mb-2">No packages match your filters</p>
              <p className="text-sm text-yellow-700 mb-4">Try adjusting your search criteria</p>
              <button
                onClick={handleResetFilters}
                className="bg-gradient-to-r from-[#566614] to-[#6E6B40] text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                Clear All Filters
              </button>
            </div>
          )}

          {/* Package Grid */}
          <PackageGrid
            packages={filteredPackages}
            loading={loading}
            showAgency={true}
          />
        </div>
      </div>

      <Footer />
    </div>
  )
}
