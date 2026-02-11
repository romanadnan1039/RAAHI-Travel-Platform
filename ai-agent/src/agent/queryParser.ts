import { ParsedQuery } from '../types'
import { detectLanguage } from '../utils/languageDetector'

const PAKISTANI_DESTINATIONS = [
  'hunza', 'swat', 'naran', 'kaghan', 'skardu', 'neelum', 'kashmir',
  'murree', 'nathia gali', 'chitral', 'kalash', 'kumrat', 'gilgit',
  'fairy meadows', 'attabad', 'sharda', 'kel', 'kalam', 'malam jabba',
  'islamabad', 'lahore', 'karachi'
]

// Destination aliases for better matching
const DESTINATION_ALIASES: Record<string, string> = {
  'hunza valley': 'hunza',
  'swat valley': 'swat',
  'naran kaghan': 'naran',
  'kaghan valley': 'naran',
  'neelum valley': 'neelum',
  'fairy meadow': 'fairy meadows',
  'nathiagali': 'nathia gali'
}

// Budget keywords
const BUDGET_KEYWORDS = {
  cheap: { max: 15000, type: 'budget' as const },
  budget: { max: 20000, type: 'budget' as const },
  sasta: { max: 15000, type: 'budget' as const },
  affordable: { max: 30000, type: 'budget' as const },
  moderate: { min: 30000, max: 60000, type: 'standard' as const },
  expensive: { min: 60000, type: 'luxury' as const },
  luxury: { min: 100000, type: 'luxury' as const },
  mahanga: { min: 60000, type: 'luxury' as const },
  premium: { min: 80000, type: 'luxury' as const }
}

// Travel type keywords
const TRAVEL_TYPE_KEYWORDS = {
  family: ['family', 'families', 'kids', 'children', 'khandan'],
  adventure: ['adventure', 'trek', 'hiking', 'climb', 'trekking'],
  luxury: ['luxury', 'premium', 'deluxe', '5 star', 'vip'],
  budget: ['budget', 'cheap', 'affordable', 'economy', 'sasta'],
  weekend: ['weekend', 'short', '2 days', '2 din']
}

// Intent keywords
const INTENT_KEYWORDS = {
  book: ['book', 'reserve', 'lena hai', 'booking', 'reserve karna'],
  browse: ['show', 'find', 'search', 'dikhao', 'batao', 'suggest'],
  compare: ['compare', 'vs', 'difference', 'better'],
  info: ['about', 'details', 'information', 'kya hai']
}

export const parseUserQuery = (query: string): ParsedQuery => {
  const lowerQuery = query.toLowerCase()
  const result: ParsedQuery = {
    language: detectLanguage(query)
  }
  
  console.log('🔍 Parsing query:', query)
  
  // 1. Extract destination
  // Check aliases first
  for (const [alias, dest] of Object.entries(DESTINATION_ALIASES)) {
    if (lowerQuery.includes(alias)) {
      result.destination = dest.charAt(0).toUpperCase() + dest.slice(1)
      break
    }
  }
  
  // If no alias match, check direct destinations
  if (!result.destination) {
    for (const dest of PAKISTANI_DESTINATIONS) {
      if (lowerQuery.includes(dest)) {
        result.destination = dest.split(' ').map(w => 
          w.charAt(0).toUpperCase() + w.slice(1)
        ).join(' ')
        break
      }
    }
  }
  
  // 2. Extract duration
  // Match patterns like: "2 days", "3 din", "2-3 days"
  const durationPatterns = [
    /(\d+)\s*(?:day|days)/i,
    /(\d+)\s*(?:din)/i,
    /(\d+)-(\d+)\s*(?:day|days|din)/i
  ]
  
  for (const pattern of durationPatterns) {
    const match = query.match(pattern)
    if (match) {
      result.duration = parseInt(match[1])
      break
    }
  }
  
  // Special duration keywords
  if (lowerQuery.includes('weekend')) {
    result.duration = 2
  } else if (lowerQuery.includes('week') && !result.duration) {
    result.duration = 7
  }
  
  // 3. Extract budget
  // Match patterns like: "20k", "under 30000", "30 hazar"
  const budgetPatterns = [
    /under\s*(\d+)k/i,
    /under\s*(\d+)\s*(?:thousand|hazar)/i,
    /(\d+)k/i,
    /(\d+)\s*(?:thousand|hazar)/i,
    /(\d+)\s*rupees/i,
    /rs\.?\s*(\d+)/i,
    /pkr\s*(\d+)/i
  ]
  
  for (const pattern of budgetPatterns) {
    const match = query.match(pattern)
    if (match) {
      let amount = parseInt(match[1])
      // If pattern includes 'k', multiply by 1000
      if (pattern.source.includes('k')) {
        amount = amount * 1000
      }
      // If pattern includes 'thousand' or 'hazar', already in thousands
      result.budget = amount
      break
    }
  }
  
  // Budget keywords (cheap, luxury, etc.)
  for (const [keyword, config] of Object.entries(BUDGET_KEYWORDS)) {
    if (lowerQuery.includes(keyword)) {
      if ('max' in config && config.max && !result.budget) result.budget = config.max
      if (config.type && (config.type === 'budget' || config.type === 'luxury')) {
        result.travelType = config.type
      }
      break
    }
  }
  
  // 4. Extract travelers
  const travelerPatterns = [
    /(\d+)\s*(?:people|person|persons|log)/i,
    /(\d+)\s*(?:travelers|travellers)/i,
    /for\s*(\d+)/i
  ]
  
  for (const pattern of travelerPatterns) {
    const match = query.match(pattern)
    if (match) {
      result.travelers = parseInt(match[1])
      break
    }
  }
  
  // Special traveler keywords
  if (lowerQuery.includes('solo') || lowerQuery.includes('alone')) {
    result.travelers = 1
  } else if (lowerQuery.includes('couple')) {
    result.travelers = 2
  } else if (lowerQuery.includes('family')) {
    result.travelers = 4
    result.travelType = 'family'
  }
  
  // 5. Detect travel type
  if (!result.travelType) {
    for (const [type, keywords] of Object.entries(TRAVEL_TYPE_KEYWORDS)) {
      if (keywords.some(keyword => lowerQuery.includes(keyword))) {
        result.travelType = type as any
        break
      }
    }
  }
  
  // 6. Detect intent
  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
    if (keywords.some(keyword => lowerQuery.includes(keyword))) {
      result.intent = intent as any
      break
    }
  }
  
  // Default intent
  if (!result.intent) {
    result.intent = 'browse'
  }
  
  console.log('✅ Parsed query:', JSON.stringify(result, null, 2))
  
  return result
}

// Helper function to extract price range
export const extractPriceRange = (query: string): { min?: number; max?: number } => {
  const lowerQuery = query.toLowerCase()
  const result: { min?: number; max?: number } = {}
  
  // Pattern: "between X and Y"
  const betweenMatch = query.match(/between\s*(\d+)k?\s*and\s*(\d+)k?/i)
  if (betweenMatch) {
    result.min = parseInt(betweenMatch[1]) * 1000
    result.max = parseInt(betweenMatch[2]) * 1000
    return result
  }
  
  // Pattern: "under X" or "below X"
  const underMatch = query.match(/(?:under|below)\s*(\d+)k?/i)
  if (underMatch) {
    result.max = parseInt(underMatch[1]) * 1000
    return result
  }
  
  // Pattern: "above X" or "over X"
  const aboveMatch = query.match(/(?:above|over)\s*(\d+)k?/i)
  if (aboveMatch) {
    result.min = parseInt(aboveMatch[1]) * 1000
    return result
  }
  
  return result
}
