import { Language } from './languageDetector'
import { PackageRecommendation } from '../types'

interface TemplateData {
  count: number
  destination?: string
  budget?: number
  duration?: number
  recommendations: PackageRecommendation[]
  minPrice?: number
  maxPrice?: number
}

// English Templates
const ENGLISH_TEMPLATES = {
  many: (data: TemplateData) => {
    const { count, destination, budget, duration, minPrice, maxPrice } = data
    let response = `Great! I found ${count} amazing packages`
    
    if (destination) response += ` to ${destination}`
    if (duration) response += ` for ${duration} ${duration === 1 ? 'day' : 'days'}`
    if (budget) response += ` under PKR ${budget.toLocaleString()}`
    
    response += '! '
    
    if (minPrice && maxPrice) {
      response += `Prices range from PKR ${minPrice.toLocaleString()} to PKR ${maxPrice.toLocaleString()}. `
    }
    
    response += 'Here are the top picks for you:'
    return response
  },
  
  few: (data: TemplateData) => {
    const { count, destination } = data
    let response = `I found ${count} ${count === 1 ? 'package' : 'packages'}`
    if (destination) response += ` to ${destination}`
    response += '. '
    
    if (count === 1) {
      response += 'Here it is:'
    } else {
      response += 'Check them out:'
    }
    return response
  },
  
  none: (data: TemplateData) => {
    const { destination, budget, duration } = data
    let response = 'I couldn\'t find exact matches'
    
    const criteria = []
    if (destination) criteria.push(destination)
    if (budget) criteria.push(`under PKR ${budget.toLocaleString()}`)
    if (duration) criteria.push(`${duration} days`)
    
    if (criteria.length > 0) {
      response += ` for ${criteria.join(', ')}`
    }
    
    response += ', but I have some great alternatives! Would you like to see:'
    response += '\n- Similar destinations'
    response += '\n- Flexible duration packages'
    response += '\n- Higher budget options'
    
    return response
  },
  
  greeting: () => {
    const greetings = [
      'Hello! I\'m RAAHI, your travel assistant. How can I help you plan your trip today?',
      'Welcome to RAAHI! Looking for the perfect travel package? Tell me where you want to go!',
      'Hi there! Ready to explore Pakistan\'s beautiful destinations? What are you looking for?'
    ]
    return greetings[Math.floor(Math.random() * greetings.length)]
  },
  
  clarify: (missing: string[]) => {
    if (missing.includes('destination')) {
      return 'Which destination are you interested in? Popular options include Hunza, Swat, Naran, Skardu, and Murree.'
    }
    if (missing.includes('budget')) {
      return 'What\'s your budget range? This helps me find the perfect package for you!'
    }
    if (missing.includes('duration')) {
      return 'How many days are you planning to travel?'
    }
    return 'Could you provide more details about your trip preferences?'
  }
}

// Urdu/Roman Urdu Templates
const URDU_TEMPLATES = {
  many: (data: TemplateData) => {
    const { count, destination, budget, duration } = data
    let response = `Bahut acha! ${count} packages mil gaye`
    
    if (destination) response += ` ${destination} ke liye`
    if (duration) response += `, ${duration} din ke liye`
    if (budget) response += `, PKR ${budget.toLocaleString()} ke andar`
    
    response += '! Yeh dekhen:'
    return response
  },
  
  few: (data: TemplateData) => {
    const { count, destination } = data
    let response = `${count} package${count > 1 ? 's' : ''} mil ${count > 1 ? 'gaye' : 'gaya'}`
    if (destination) response += ` ${destination} ke liye`
    response += '. Yeh dekhen:'
    return response
  },
  
  none: (data: TemplateData) => {
    const { destination, budget } = data
    let response = 'Exact match nahi mila'
    
    if (destination || budget) {
      response += ' lekin aur options hain! '
    }
    
    response += 'Kya aap:'
    response += '\n- Milte julte destinations dekhna chahenge?'
    response += '\n- Budget thoda increase kar sakte hain?'
    
    return response
  },
  
  greeting: () => {
    const greetings = [
      'Assalam-o-Alaikum! Main RAAHI hoon, aapka travel assistant. Kahan jana chahte hain?',
      'Khush amdeed! RAAHI mein aap ko kaun se destinations pasand hain?',
      'Hello! Main aap ki trip plan karne mein madad kar sakta hoon. Bataye kya chahiye?'
    ]
    return greetings[Math.floor(Math.random() * greetings.length)]
  },
  
  clarify: (missing: string[]) => {
    if (missing.includes('destination')) {
      return 'Kaunsa destination chahiye? Hunza, Swat, Naran, Skardu ya Murree?'
    }
    if (missing.includes('budget')) {
      return 'Aap ka budget kya hai? Isse behtar packages mil jayenge!'
    }
    if (missing.includes('duration')) {
      return 'Kitne din ke liye trip plan kar rahe hain?'
    }
    return 'Thodi aur details bata sakte hain?'
  }
}

export const generateResponse = (
  recommendations: PackageRecommendation[],
  query: string,
  language: Language = 'english',
  parsedQuery?: any
): string => {
  const templates = language === 'urdu' ? URDU_TEMPLATES : ENGLISH_TEMPLATES
  
  const data: TemplateData = {
    count: recommendations.length,
    destination: parsedQuery?.destination,
    budget: parsedQuery?.budget,
    duration: parsedQuery?.duration,
    recommendations,
    minPrice: recommendations.length > 0 ? Math.min(...recommendations.map(r => r.price)) : undefined,
    maxPrice: recommendations.length > 0 ? Math.max(...recommendations.map(r => r.price)) : undefined
  }
  
  // Generate response based on result count
  if (recommendations.length === 0) {
    return templates.none(data)
  } else if (recommendations.length <= 2) {
    return templates.few(data)
  } else {
    return templates.many(data)
  }
}

// Generate clarifying question when query is too vague
export const generateClarifyingQuestion = (
  parsedQuery: any,
  language: Language = 'english'
): string | null => {
  const missing: string[] = []
  
  if (!parsedQuery.destination) missing.push('destination')
  if (!parsedQuery.budget && !parsedQuery.duration) missing.push('budget')
  
  if (missing.length > 0) {
    const templates = language === 'urdu' ? URDU_TEMPLATES : ENGLISH_TEMPLATES
    return templates.clarify(missing)
  }
  
  return null
}

// Greeting messages
export const getGreeting = (language: Language = 'english'): string => {
  const templates = language === 'urdu' ? URDU_TEMPLATES : ENGLISH_TEMPLATES
  return templates.greeting()
}

// Package details formatter
export const formatPackageDetails = (pkg: PackageRecommendation, language: Language = 'english'): string => {
  if (language === 'urdu') {
    return `${pkg.title} - PKR ${pkg.price.toLocaleString()}, ${pkg.duration} din, Rating: ${pkg.rating}/5`
  }
  return `${pkg.title} - PKR ${pkg.price.toLocaleString()}, ${pkg.duration} ${pkg.duration === 1 ? 'day' : 'days'}, Rating: ${pkg.rating}/5`
}
