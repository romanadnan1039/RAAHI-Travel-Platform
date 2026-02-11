// Custom AI Travel Agent - No OpenAI Required!
// Uses advanced query parsing, scoring algorithms, and template-based responses

import { findMatchingPackages, findAlternativePackages } from './recommendationEngine'
import { parseUserQuery } from './queryParser'
import { createChatResponse } from './responseGenerator'
import { updateContext, getOrCreateContext, mergeContextWithQuery, isRefinementQuery } from './conversationManager'
import { ParsedQuery, PackageRecommendation } from '../types'

export { ParsedQuery } from '../types'

export const processTravelQuery = async (
  query: string,
  conversationId: string = 'default'
) => {
  console.log('\n' + '='.repeat(60))
  console.log('🤖 RAAHI AI Agent - Processing Query')
  console.log('='.repeat(60))
  console.log('Query:', query)
  console.log('Conversation ID:', conversationId)
  
  try {
    // Get or create conversation context
    const context = getOrCreateContext(conversationId)
    
    // Parse the user's query using custom NLP
    let parsed = parseUserQuery(query)
    console.log('\n📋 Initial Parse:', parsed)
    
    // Check if this is a refinement of previous query
    const isRefinement = isRefinementQuery(query, context)
    
    if (isRefinement) {
      console.log('🔄 Detected refinement query - merging with previous context')
      parsed = mergeContextWithQuery(context, parsed)
      console.log('📋 Merged Parse:', parsed)
    }
    
    // Update conversation context
    updateContext(conversationId, query, parsed)
    
    // Find matching packages using enhanced recommendation engine
    let recommendations: PackageRecommendation[] = await findMatchingPackages({
      destination: parsed.destination,
      duration: parsed.duration,
      budget: parsed.budget,
      travelType: parsed.travelType,
      travelers: parsed.travelers
    })
    
    // If no matches, try alternatives
    if (recommendations.length === 0 && (parsed.destination || parsed.budget)) {
      console.log('\n🔍 No exact matches, searching alternatives...')
      recommendations = await findAlternativePackages(parsed)
    }
    
    console.log(`\n📦 Final recommendations: ${recommendations.length}`)
    
    // Generate natural language response using templates
    const response = createChatResponse(query, recommendations, parsed)
    
    console.log('\n💬 Response:', response.substring(0, 150) + '...')
    console.log('='.repeat(60) + '\n')
    
    return {
      response,
      recommendations,
      parsedQuery: parsed,
      conversationId
    }
    
  } catch (error) {
    console.error('❌ Error processing query:', error)
    
    return {
      response: 'Sorry, I encountered an error. Please try rephrasing your query or contact support.',
      recommendations: [],
      parsedQuery: {},
      conversationId,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Legacy export for backward compatibility
export { parseUserQuery }

// Export for testing
export const testQueryParser = (query: string) => {
  console.log('\n🧪 Testing Query Parser')
  console.log('Input:', query)
  const result = parseUserQuery(query)
  console.log('Output:', JSON.stringify(result, null, 2))
  return result
}
