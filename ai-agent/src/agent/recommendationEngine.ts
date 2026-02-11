import { searchPackages } from '../services/apiClient'
import { PackageRecommendation } from '../types'

export const findMatchingPackages = async (criteria: {
  destination?: string
  duration?: number
  budget?: number
  travelType?: string
  travelers?: number
}): Promise<PackageRecommendation[]> => {
  const filters: any = {}

  if (criteria.destination) {
    filters.destination = criteria.destination
  }

  if (criteria.duration) {
    filters.duration = criteria.duration
  }

  if (criteria.budget) {
    filters.maxPrice = criteria.budget
  }

  console.log('🔍 Searching packages with filters:', filters)

  const response = await searchPackages(filters)

  if (!response.success || !response.data) {
    console.warn('⚠️ No packages found or API error')
    return []
  }

  const packagesData = response.data.data || response.data.packages || response.data || []
  const packages = Array.isArray(packagesData) ? packagesData : []

  console.log(`📦 Found ${packages.length} packages from database`)

  // Enhanced scoring algorithm
  const scoredPackages: PackageRecommendation[] = packages.map((pkg: any) => {
    let score = 0
    const reasons: string[] = []

    // 1. Destination match (35 points)
    if (criteria.destination) {
      const destMatch = pkg.destination.toLowerCase().includes(criteria.destination.toLowerCase())
      if (destMatch) {
        score += 35
        reasons.push('destination match')
      }
    }

    // 2. Duration match (25 points)
    if (criteria.duration) {
      const durationDiff = Math.abs(pkg.duration - criteria.duration)
      if (durationDiff === 0) {
        score += 25
        reasons.push('exact duration')
      } else if (durationDiff === 1) {
        score += 18
        reasons.push('close duration')
      } else if (durationDiff === 2) {
        score += 10
        reasons.push('similar duration')
      }
    }

    // 3. Budget match (25 points)
    if (criteria.budget) {
      const price = Number(pkg.price)
      const priceRatio = price / criteria.budget
      
      if (priceRatio <= 0.8) {
        score += 25 // Well under budget
        reasons.push('great value')
      } else if (priceRatio <= 1.0) {
        score += 20 // Within budget
        reasons.push('within budget')
      } else if (priceRatio <= 1.15) {
        score += 12 // Slightly over
        reasons.push('slightly over budget')
      } else if (priceRatio <= 1.3) {
        score += 5 // Worth considering
      }
    }

    // 4. Rating bonus (10 points)
    const ratingScore = (pkg.rating || 0) * 2
    score += ratingScore
    if (pkg.rating >= 4.5) reasons.push('highly rated')

    // 5. Popularity bonus (5 points)
    if (pkg.totalBookings && pkg.totalBookings > 10) {
      score += 5
      reasons.push('popular choice')
    }

    // 6. Travel type match (bonus 10 points)
    if (criteria.travelType) {
      const titleLower = pkg.title.toLowerCase()
      if (titleLower.includes(criteria.travelType)) {
        score += 10
        reasons.push('type match')
      }
    }

    // 7. Capacity match (bonus 5 points)
    if (criteria.travelers && pkg.maxTravelers >= criteria.travelers) {
      score += 5
      reasons.push('capacity suitable')
    }

    // 8. Availability bonus (5 points)
    if (pkg.isActive) {
      score += 5
    }

    const recommendation: PackageRecommendation = {
      ...pkg,
      id: pkg.id,
      packageId: pkg.id,
      price: Number(pkg.price),
      rating: pkg.rating || 0,
      matchScore: Math.min(100, Math.round(score)),
    }

    // Ensure images array exists
    if (!recommendation.images || recommendation.images.length === 0) {
      recommendation.images = [
        'https://images.pexels.com/photos/1578750/pexels-photo-1578750.jpeg?w=800&h=600&fit=crop',
        'https://images.pexels.com/photos/1118877/pexels-photo-1118877.jpeg?w=800&h=600&fit=crop',
        'https://images.pexels.com/photos/1029599/pexels-photo-1029599.jpeg?w=800&h=600&fit=crop',
      ]
    }

    console.log(`   Package: ${pkg.title} - Score: ${recommendation.matchScore}% (${reasons.join(', ')})`)

    return recommendation
  })

  // Sort by match score and return top 5 (increased from 3)
  const topRecommendations = scoredPackages
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 5)

  console.log(`\n✅ Returning top ${topRecommendations.length} recommendations`)

  return topRecommendations
}

// Alternative packages when no exact matches
export const findAlternativePackages = async (originalCriteria: any): Promise<PackageRecommendation[]> => {
  console.log('🔄 Finding alternative packages...')
  
  // Relax criteria
  const relaxedCriteria: any = {}
  
  // Keep destination if provided
  if (originalCriteria.destination) {
    relaxedCriteria.destination = originalCriteria.destination
  }
  
  // Increase budget by 50% if provided
  if (originalCriteria.budget) {
    relaxedCriteria.budget = Math.round(originalCriteria.budget * 1.5)
  }
  
  // Allow +/- 1 day duration flexibility
  // Don't send duration filter to get more results
  
  return await findMatchingPackages(relaxedCriteria)
}

