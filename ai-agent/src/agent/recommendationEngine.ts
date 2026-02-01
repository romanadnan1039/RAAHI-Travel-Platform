import { searchPackages } from '../services/apiClient'

export interface PackageRecommendation {
  packageId: string
  title: string
  destination: string
  duration: number
  price: number
  rating: number
  matchScore: number
}

export const findMatchingPackages = async (criteria: {
  destination?: string
  duration?: number
  budget?: number
}): Promise<PackageRecommendation[]> => {
  const filters: any = {}

  if (criteria.destination) {
    filters.destination = criteria.destination
  }

  if (criteria.duration) {
    filters.duration = criteria.duration
  } else if (criteria.duration === undefined) {
    // Allow some flexibility
  }

  if (criteria.budget) {
    filters.maxPrice = criteria.budget
  }

  const response = await searchPackages(filters)

  if (!response.success || !response.data) {
    return []
  }

  const packages = response.data.packages || response.data

  // Score and rank packages
  const scoredPackages: PackageRecommendation[] = packages.map((pkg: any) => {
    let score = 0

    // Destination match (40 points)
    if (criteria.destination && pkg.destination.toLowerCase().includes(criteria.destination.toLowerCase())) {
      score += 40
    }

    // Duration match (30 points)
    if (criteria.duration) {
      const durationDiff = Math.abs(pkg.duration - criteria.duration)
      if (durationDiff === 0) {
        score += 30
      } else if (durationDiff === 1) {
        score += 20
      } else if (durationDiff === 2) {
        score += 10
      }
    }

    // Budget match (20 points)
    if (criteria.budget) {
      const priceRatio = Number(pkg.price) / criteria.budget
      if (priceRatio <= 1.0) {
        score += 20
      } else if (priceRatio <= 1.2) {
        score += 15
      } else if (priceRatio <= 1.5) {
        score += 10
      }
    }

    // Rating bonus (10 points)
    score += (pkg.rating || 0) * 2

    const recommendation = {
      ...pkg, // Include all package fields (images, includes, description, etc.)
      packageId: pkg.id,
      id: pkg.id, // Ensure id is present
      price: Number(pkg.price),
      rating: pkg.rating || 0,
      matchScore: Math.min(100, Math.round(score)),
    }

    // Ensure images array exists and has fallback
    if (!recommendation.images || recommendation.images.length === 0) {
      console.warn(`⚠️ Package ${pkg.title} has no images, adding fallback`)
      recommendation.images = [
        'https://images.pexels.com/photos/1578750/pexels-photo-1578750.jpeg?w=800&h=600&fit=crop',
        'https://images.pexels.com/photos/1118877/pexels-photo-1118877.jpeg?w=800&h=600&fit=crop',
        'https://images.pexels.com/photos/1029599/pexels-photo-1029599.jpeg?w=800&h=600&fit=crop',
      ]
    }

    return recommendation
  })

  // Sort by match score and return top 3
  const topRecommendations = scoredPackages
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 3)

  // Log recommendations for debugging
  console.log(`\n📦 Returning ${topRecommendations.length} recommendations:`)
  topRecommendations.forEach((rec, idx) => {
    console.log(`${idx + 1}. ${rec.title} - Images: ${rec.images ? rec.images.length : 0}`)
  })

  return topRecommendations
}
