import axios from 'axios'
import type { ApiResponse } from '../types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle authentication errors and auto-logout
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    
    // Handle 401 Unauthorized errors (invalid/expired token)
    if (error.response?.status === 401) {
      console.error('Authentication failed:', error.response?.data)
      
      // Prevent infinite redirect loop
      if (!originalRequest._retry) {
        originalRequest._retry = true
        
        // Clear all auth data
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        
        // Show user-friendly error message
        const errorMessage = error.response?.data?.error?.message || 'Your session has expired'
        console.error('Auth Error:', errorMessage)
        
        // Only redirect if not already on login page
        if (!window.location.pathname.includes('/login')) {
          // Show notification
          if (error.response?.data?.error?.code === 'UNAUTHORIZED' || 
              error.response?.data?.error?.message?.includes('not found')) {
            alert('Your session is invalid. Please login again.')
          } else {
            alert('Session expired. Please login again.')
          }
          
          window.location.href = '/login/user'
        }
      }
    }
    
    // Handle foreign key constraint errors (stale user ID in database)
    if (error.response?.status === 400 || error.response?.status === 500) {
      const errorCode = error.response?.data?.error?.code
      
      if (errorCode === 'P2003' || errorCode === 'INVALID_USER' || errorCode === 'INVALID_DATA') {
        console.error('Data integrity error:', error.response?.data)
        
        // Clear auth data
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        
        // Show helpful message
        alert('Your account data is invalid. This usually happens after database resets. Please login again.')
        
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login/user'
        }
      }
    }
    
    return Promise.reject(error)
  }
)

export default api

export const authApi = {
  registerUser: async (data: { email: string; password: string; name: string; phone?: string }) => {
    const response = await api.post<ApiResponse<{ user: any; token: string }>>('/auth/user/register', data)
    return response.data
  },
  loginUser: async (email: string, password: string) => {
    const response = await api.post<ApiResponse<{ user: any; token: string }>>('/auth/user/login', { email, password })
    return response.data
  },
  registerAgency: async (data: {
    email: string
    password: string
    name: string
    agencyName: string
    contactEmail: string
    contactPhone: string
  }) => {
    const response = await api.post<ApiResponse<{ user: any; token: string }>>('/auth/agency/register', data)
    return response.data
  },
  loginAgency: async (email: string, password: string) => {
    const response = await api.post<ApiResponse<{ user: any; token: string }>>('/auth/agency/login', { email, password })
    return response.data
  },
  getMe: async () => {
    const response = await api.get<ApiResponse<any>>('/auth/me')
    return response.data
  },
}

export const packageApi = {
  getAll: async (params?: Record<string, any>) => {
    const response = await api.get<ApiResponse<{ packages: any[]; total: number; page: number; limit: number }>>(
      '/packages',
      { params }
    )
    return response.data
  },
  getById: async (id: string) => {
    const response = await api.get<ApiResponse<any>>(`/packages/${id}`)
    return response.data
  },
  search: async (query: string) => {
    const response = await api.get<ApiResponse<any[]>>('/packages/search', { params: { q: query } })
    return response.data
  },
  create: async (data: any) => {
    const response = await api.post<ApiResponse<any>>('/packages', data)
    return response.data
  },
  update: async (id: string, data: any) => {
    const response = await api.put<ApiResponse<any>>(`/packages/${id}`, data)
    return response.data
  },
  delete: async (id: string) => {
    const response = await api.delete<ApiResponse<void>>(`/packages/${id}`)
    return response.data
  },
  getMyPackages: async () => {
    const response = await api.get<ApiResponse<any[]>>('/packages/agency/my-packages')
    return response.data
  },
}

export const bookingApi = {
  create: async (data: { packageId: string; travelers: number; bookingDate: string; specialRequests?: string }) => {
    const response = await api.post<ApiResponse<any>>('/bookings', data)
    return response.data
  },
  getAll: async () => {
    const response = await api.get<ApiResponse<any[]>>('/bookings')
    return response.data
  },
  getById: async (id: string) => {
    const response = await api.get<ApiResponse<any>>(`/bookings/${id}`)
    return response.data
  },
  cancel: async (id: string) => {
    const response = await api.post<ApiResponse<any>>(`/bookings/${id}/cancel`)
    return response.data
  },
  getAgencyBookings: async () => {
    const response = await api.get<ApiResponse<any[]>>('/bookings/agency/my-bookings')
    return response.data
  },
  getUserBookings: async () => {
    const response = await api.get<ApiResponse<any[]>>('/bookings')
    return response.data
  },
  confirm: async (id: string) => {
    const response = await api.post<ApiResponse<any>>(`/bookings/${id}/confirm`)
    return response.data
  },
}

export const aiApi = {
  chat: async (message: string, conversationId?: string) => {
    const response = await api.post<ApiResponse<{ response: string; recommendations?: any[]; conversationId: string }>>(
      '/ai/chat',
      { message, conversationId }
    )
    return response.data
  },
  recommend: async (query: string) => {
    const response = await api.post<ApiResponse<any[]>>('/ai/recommend', { query })
    return response.data
  },
  book: async (packageId: string, data: any) => {
    const response = await api.post<ApiResponse<any>>('/ai/book', { packageId, ...data })
    return response.data
  },
}

export const notificationApi = {
  getAll: async () => {
    const response = await api.get<ApiResponse<any[]>>('/notifications')
    return response.data
  },
  getUnread: async () => {
    const response = await api.get<ApiResponse<any[]>>('/notifications/unread')
    return response.data
  },
  markRead: async (id: string) => {
    const response = await api.put<ApiResponse<void>>(`/notifications/${id}/read`)
    return response.data
  },
  markAllRead: async () => {
    const response = await api.put<ApiResponse<void>>('/notifications/read-all')
    return response.data
  },
  getCount: async () => {
    const response = await api.get<ApiResponse<{ count: number }>>('/notifications/count')
    return response.data
  },
}
