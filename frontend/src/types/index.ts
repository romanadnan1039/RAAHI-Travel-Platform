export interface User {
  id: string
  email: string
  name: string
  role: 'TOURIST' | 'AGENCY'
  phone?: string
  avatar?: string
}

export interface Agency {
  id: string
  userId: string
  agencyName: string
  description?: string
  contactEmail: string
  contactPhone: string
  address?: string
  city?: string
  country: string
  website?: string
  logo?: string
  rating: number
  totalReviews: number
  isVerified: boolean
  isActive: boolean
}

export interface Package {
  id: string
  agencyId: string
  title: string
  destination: string
  description: string
  duration: number
  price: number
  originalPrice?: number
  maxTravelers: number
  minTravelers: number
  includes: string[]
  excludes: string[]
  itinerary?: Record<string, any>
  images: string[]
  rating: number
  totalBookings: number
  totalReviews: number
  isActive: boolean
  startDate?: string
  endDate?: string
  cancellationPolicy?: string
  agency?: Agency
}

export interface Booking {
  id: string
  userId: string
  packageId: string
  agencyId: string
  travelers: number
  totalAmount: number
  bookingDate: string
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
  paymentStatus: 'PENDING' | 'PAID' | 'REFUNDED' | 'FAILED'
  paymentMethod?: string
  specialRequests?: string
  package?: Package
}

export interface Review {
  id: string
  userId: string
  packageId: string
  rating: number
  comment?: string
  images: string[]
  isVerified: boolean
  helpfulCount: number
  user?: User
}

export interface Notification {
  id: string
  agencyId: string
  bookingId?: string
  type: 'BOOKING_NEW' | 'BOOKING_CANCELLED' | 'BOOKING_UPDATED' | 'REVIEW_NEW' | 'PACKAGE_INQUIRY' | 'SYSTEM_ALERT'
  title: string
  message: string
  isRead: boolean
  readAt?: string
  metadata?: Record<string, any>
  createdAt: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: {
    code: string
    message: string
    details?: any
  }
}
