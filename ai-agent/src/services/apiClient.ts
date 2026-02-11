import axios from 'axios'

// Support both BACKEND_URL and BACKEND_API_URL environment variables
const getBackendUrl = (): string => {
  const backendUrl = process.env.BACKEND_URL || process.env.BACKEND_API_URL || 'http://localhost:5000'
  
  // Add /api suffix if not present
  const url = backendUrl.endsWith('/api') ? backendUrl : `${backendUrl}/api`
  
  console.log('🔗 AI Agent connecting to backend:', url)
  return url
}

const BACKEND_API_URL = getBackendUrl()

export const apiClient = axios.create({
  baseURL: BACKEND_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
})

// Add request logging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`📤 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`)
    return config
  },
  (error) => {
    console.error('❌ API Request Error:', error.message)
    return Promise.reject(error)
  }
)

// Add response logging
apiClient.interceptors.response.use(
  (response) => {
    console.log(`📥 API Response: ${response.status} - ${response.config.url}`)
    return response
  },
  (error) => {
    console.error(`❌ API Error: ${error.message}`, {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data
    })
    return Promise.reject(error)
  }
)

export const searchPackages = async (filters: {
  destination?: string
  minPrice?: number
  maxPrice?: number
  duration?: number
  minDuration?: number
  maxDuration?: number
}) => {
  const response = await apiClient.get('/packages', { params: filters })
  return response.data
}

export const createBooking = async (data: {
  packageId: string
  travelers: number
  bookingDate: string
  specialRequests?: string
}, token: string) => {
  const response = await apiClient.post('/bookings', data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return response.data
}
