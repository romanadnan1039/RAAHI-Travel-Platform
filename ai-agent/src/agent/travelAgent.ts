import { openai, OPENAI_MODEL } from '../config/openai'
import { findMatchingPackages } from './recommendationEngine'

export interface ParsedQuery {
  destination?: string
  duration?: number
  budget?: number
  travelers?: number
}

const PAKISTANI_DESTINATIONS = [
  'hunza', 'swat', 'naran', 'kaghan', 'skardu', 'neelum', 'kashmir',
  'murree', 'nathia gali', 'chitral', 'kalash', 'kumrat', 'gilgit',
  'fairy meadows', 'attabad', 'sharda', 'kel', 'kalam', 'malam jabba'
]

export const parseUserQuery = async (query: string): Promise<ParsedQuery> => {
  const prompt = `Extract travel information from this query. Return JSON with destination, duration (in days), budget (in PKR), and travelers (number of people).
  
Query: "${query}"

Pakistani destinations to recognize: ${PAKISTANI_DESTINATIONS.join(', ')}

Return JSON only, no other text. Example: {"destination": "Hunza", "duration": 2, "budget": 20000, "travelers": 2}`

  try {
    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are a travel assistant for Pakistan. Extract travel details from user queries and return JSON only.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 200,
    })

    const content = response.choices[0]?.message?.content || '{}'
    const parsed = JSON.parse(content.trim())
    return parsed
  } catch (error) {
    // Fallback parsing
    const lowerQuery = query.toLowerCase()
    const result: ParsedQuery = {}

    // Extract destination
    for (const dest of PAKISTANI_DESTINATIONS) {
      if (lowerQuery.includes(dest)) {
        result.destination = dest.charAt(0).toUpperCase() + dest.slice(1)
        break
      }
    }

    // Extract duration
    const durationMatch = query.match(/(\d+)\s*(?:day|days|din)/i)
    if (durationMatch) {
      result.duration = parseInt(durationMatch[1])
    }

    // Extract budget
    const budgetMatch = query.match(/(\d+)\s*(?:k|thousand|hazar)/i)
    if (budgetMatch) {
      result.budget = parseInt(budgetMatch[1]) * 1000
    }

    return result
  }
}

export const generateResponse = async (
  query: string,
  recommendations: any[]
): Promise<string> => {
  const prompt = `You are RAAHI, a friendly travel assistant for Pakistan. The user asked: "${query}"

I found ${recommendations.length} package(s) for them:
${recommendations.map((r, i) => `${i + 1}. ${r.title} - PKR ${r.price.toLocaleString()} (${r.duration} days, Match: ${r.matchScore}%)`).join('\n')}

Generate a friendly, helpful response in English (or Urdu if the query was in Urdu). Mention the packages naturally and encourage them to select one.`

  try {
    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are RAAHI, a friendly travel assistant helping users find travel packages in Pakistan. Respond naturally and helpfully.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 300,
    })

    return response.choices[0]?.message?.content || 'I found some packages for you!'
  } catch (error) {
    return `I found ${recommendations.length} great package(s) for you! Please check the recommendations above.`
  }
}

export const processTravelQuery = async (query: string) => {
  // Parse the query
  const parsed = await parseUserQuery(query)

  // Find matching packages
  const recommendations = await findMatchingPackages({
    destination: parsed.destination,
    duration: parsed.duration,
    budget: parsed.budget,
  })

  // Generate response
  const response = await generateResponse(query, recommendations)

  return {
    response,
    recommendations,
    parsedQuery: parsed,
  }
}
