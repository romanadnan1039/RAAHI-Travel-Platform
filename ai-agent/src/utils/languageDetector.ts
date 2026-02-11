export type Language = 'english' | 'urdu' | 'mixed'

interface LanguageKeywords {
  english: string[]
  urdu: string[]
}

const KEYWORDS: LanguageKeywords = {
  english: [
    'show', 'find', 'suggest', 'recommend', 'search', 'want', 'need',
    'looking', 'cheap', 'expensive', 'budget', 'luxury', 'family',
    'package', 'tour', 'trip', 'visit', 'go', 'travel'
  ],
  urdu: [
    'dikhao', 'dikha', 'batao', 'bata', 'chahiye', 'chahie',
    'lena hai', 'lena', 'jana hai', 'jana', 'sasta', 'mahanga',
    'din', 'hazar', 'rupay', 'family', 'khandan'
  ]
}

export const detectLanguage = (text: string): Language => {
  const lowerText = text.toLowerCase()
  
  let englishCount = 0
  let urduCount = 0
  
  // Count English keywords
  KEYWORDS.english.forEach(keyword => {
    if (lowerText.includes(keyword)) englishCount++
  })
  
  // Count Urdu keywords
  KEYWORDS.urdu.forEach(keyword => {
    if (lowerText.includes(keyword)) urduCount++
  })
  
  // Determine language
  if (urduCount > englishCount && urduCount > 0) {
    return 'urdu'
  } else if (englishCount > 0 && urduCount > 0) {
    return 'mixed'
  } else {
    return 'english' // Default to English
  }
}

export const hasUrduContent = (text: string): boolean => {
  const lowerText = text.toLowerCase()
  return KEYWORDS.urdu.some(keyword => lowerText.includes(keyword))
}
