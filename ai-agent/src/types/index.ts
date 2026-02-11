export interface ParsedQuery {
  destination?: string
  duration?: number
  budget?: number
  travelers?: number
  travelType?: 'budget' | 'luxury' | 'family' | 'adventure' | 'weekend'
  intent?: 'book' | 'browse' | 'compare' | 'info'
  language?: 'english' | 'urdu' | 'mixed'
}

export interface PackageRecommendation {
  id: string
  packageId: string
  title: string
  destination: string
  duration: number
  price: number
  rating: number
  matchScore: number
  agencyName?: string
  images?: string[]
  includes?: string[]
  description?: string
}

export interface ConversationContext {
  conversationId: string
  queries: string[]
  lastParsed?: ParsedQuery
  preferences?: {
    budget?: number
    destinations?: string[]
    travelType?: 'budget' | 'luxury' | 'family' | 'adventure' | 'weekend'
  }
  timestamp: number
}
