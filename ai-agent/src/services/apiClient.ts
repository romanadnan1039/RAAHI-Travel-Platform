import axios from 'axios'

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:5000/api'

export const apiClient = axios.create({
  baseURL: BACKEND_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

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
