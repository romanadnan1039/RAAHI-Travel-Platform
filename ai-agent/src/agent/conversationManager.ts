import { ConversationContext, ParsedQuery } from '../types'

// In-memory storage (in production, use Redis or database)
const conversations = new Map<string, ConversationContext>()

// Session timeout: 30 minutes
const SESSION_TIMEOUT = 30 * 60 * 1000

export const getOrCreateContext = (conversationId: string): ConversationContext => {
  let context = conversations.get(conversationId)
  
  if (!context) {
    context = {
      conversationId,
      queries: [],
      timestamp: Date.now()
    }
    conversations.set(conversationId, context)
    console.log(`📝 Created new conversation: ${conversationId}`)
  } else {
    // Check if session expired
    if (Date.now() - context.timestamp > SESSION_TIMEOUT) {
      console.log(`⏰ Session expired for: ${conversationId}`)
      context = {
        conversationId,
        queries: [],
        timestamp: Date.now()
      }
      conversations.set(conversationId, context)
    }
  }
  
  return context
}

export const updateContext = (
  conversationId: string,
  query: string,
  parsedQuery: ParsedQuery
): ConversationContext => {
  const context = getOrCreateContext(conversationId)
  
  // Add query to history
  context.queries.push(query)
  
  // Keep only last 10 queries
  if (context.queries.length > 10) {
    context.queries = context.queries.slice(-10)
  }
  
  // Update last parsed query
  context.lastParsed = parsedQuery
  
  // Update preferences based on query
  if (!context.preferences) {
    context.preferences = {}
  }
  
  if (parsedQuery.budget && (!context.preferences.budget || parsedQuery.budget > 0)) {
    context.preferences.budget = parsedQuery.budget
  }
  
  if (parsedQuery.destination) {
    if (!context.preferences.destinations) {
      context.preferences.destinations = []
    }
    if (!context.preferences.destinations.includes(parsedQuery.destination)) {
      context.preferences.destinations.push(parsedQuery.destination)
    }
  }
  
  if (parsedQuery.travelType) {
    context.preferences.travelType = parsedQuery.travelType
  }
  
  // Update timestamp
  context.timestamp = Date.now()
  
  conversations.set(conversationId, context)
  
  console.log(`💬 Updated context for ${conversationId}:`, {
    totalQueries: context.queries.length,
    preferences: context.preferences
  })
  
  return context
}

export const getContext = (conversationId: string): ConversationContext | undefined => {
  return conversations.get(conversationId)
}

// Merge previous context with new query to fill missing information
export const mergeContextWithQuery = (
  context: ConversationContext | undefined,
  newQuery: ParsedQuery
): ParsedQuery => {
  if (!context || !context.lastParsed) {
    return newQuery
  }
  
  const merged: ParsedQuery = { ...newQuery }
  
  // Fill missing fields from previous query or preferences
  if (!merged.destination && context.lastParsed.destination) {
    merged.destination = context.lastParsed.destination
    console.log(`   Using previous destination: ${merged.destination}`)
  }
  
  if (!merged.budget && context.preferences?.budget) {
    merged.budget = context.preferences.budget
    console.log(`   Using previous budget: ${merged.budget}`)
  }
  
  if (!merged.duration && context.lastParsed.duration) {
    merged.duration = context.lastParsed.duration
    console.log(`   Using previous duration: ${merged.duration}`)
  }
  
  if (!merged.travelType && context.preferences?.travelType) {
    merged.travelType = context.preferences.travelType
    console.log(`   Using previous travel type: ${merged.travelType}`)
  }
  
  return merged
}

// Detect if user is refining previous query
export const isRefinementQuery = (query: string, context: ConversationContext | undefined): boolean => {
  if (!context || context.queries.length === 0) {
    return false
  }
  
  const refinementKeywords = [
    'cheaper', 'expensive', 'longer', 'shorter', 'under', 'over',
    'more', 'less', 'different', 'another', 'alternative',
    'sasta', 'mahanga', 'lambi', 'choti', 'aur'
  ]
  
  const lowerQuery = query.toLowerCase()
  return refinementKeywords.some(keyword => lowerQuery.includes(keyword))
}

// Clean up old conversations (call periodically)
export const cleanupOldSessions = (): void => {
  const now = Date.now()
  let cleaned = 0
  
  for (const [id, context] of conversations.entries()) {
    if (now - context.timestamp > SESSION_TIMEOUT) {
      conversations.delete(id)
      cleaned++
    }
  }
  
  if (cleaned > 0) {
    console.log(`🧹 Cleaned up ${cleaned} expired sessions`)
  }
}

// Run cleanup every 10 minutes
setInterval(cleanupOldSessions, 10 * 60 * 1000)
