import { PackageRecommendation, ParsedQuery } from '../types'
import { Language } from '../utils/languageDetector'
import { generateResponse, generateClarifyingQuestion, getGreeting, formatPackageDetails } from '../utils/templates'

export const createChatResponse = (
  query: string,
  recommendations: PackageRecommendation[],
  parsedQuery: ParsedQuery
): string => {
  const language = parsedQuery.language || 'english'
  
  // Handle greetings
  const greetingKeywords = ['hi', 'hello', 'hey', 'salam', 'assalam']
  if (greetingKeywords.some(kw => query.toLowerCase().includes(kw)) && query.split(' ').length <= 3) {
    return getGreeting(language)
  }
  
  // Check if query is too vague
  if (!parsedQuery.destination && !parsedQuery.budget && !parsedQuery.duration && !parsedQuery.travelType) {
    const clarification = generateClarifyingQuestion(parsedQuery, language)
    if (clarification) return clarification
  }
  
  // Generate main response
  const mainResponse = generateResponse(recommendations, query, language, parsedQuery)
  
  // Add package details if there are recommendations
  if (recommendations.length > 0) {
    let detailsText = '\n\n'
    recommendations.forEach((pkg, idx) => {
      const matchIndicator = pkg.matchScore >= 80 ? '🌟' : pkg.matchScore >= 60 ? '⭐' : '✨'
      detailsText += `${matchIndicator} ${formatPackageDetails(pkg, language)}\n`
    })
    
    return mainResponse + detailsText
  }
  
  return mainResponse
}

// Generate helpful suggestions
export const generateSuggestions = (parsedQuery: ParsedQuery, language: Language = 'english'): string[] => {
  const suggestions: string[] = []
  
  if (language === 'urdu') {
    if (!parsedQuery.destination) {
      suggestions.push('Hunza packages dikhao')
      suggestions.push('Swat ke liye options')
    }
    if (!parsedQuery.budget) {
      suggestions.push('20k ke andar packages')
      suggestions.push('Sasta packages')
    }
  } else {
    if (!parsedQuery.destination) {
      suggestions.push('Show me Hunza packages')
      suggestions.push('Find Swat tours')
    }
    if (!parsedQuery.budget) {
      suggestions.push('Under 30k packages')
      suggestions.push('Budget friendly trips')
    }
    if (!parsedQuery.duration) {
      suggestions.push('Weekend packages')
      suggestions.push('2 day trips')
    }
  }
  
  return suggestions.slice(0, 3) // Return top 3 suggestions
}
