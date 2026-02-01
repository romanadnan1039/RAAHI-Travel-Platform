import prisma from '../config/database'
import { hashPassword, comparePassword } from '../utils/password.util'
import { generateToken } from '../utils/jwt.util'
import { ApiResponse } from '../types'

export const registerUser = async (data: {
  email: string
  password: string
  name: string
  phone?: string
}): Promise<ApiResponse> => {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  })

  if (existingUser) {
    return {
      success: false,
      error: {
        code: 'USER_EXISTS',
        message: 'User with this email already exists',
      },
    }
  }

  // Hash password
  const hashedPassword = await hashPassword(data.password)

  // Create user
  const user = await prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      name: data.name,
      phone: data.phone,
      role: 'TOURIST',
    },
  })

  // Create tourist profile
  await prisma.tourist.create({
    data: {
      userId: user.id,
    },
  })

  // Generate token
  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role as 'TOURIST',
  })

  return {
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
      },
      token,
    },
  }
}

export const loginUser = async (email: string, password: string): Promise<ApiResponse> => {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { touristProfile: true },
  })

  if (!user || user.role !== 'TOURIST') {
    return {
      success: false,
      error: {
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      },
    }
  }

  const isPasswordValid = await comparePassword(password, user.password)
  if (!isPasswordValid) {
    return {
      success: false,
      error: {
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      },
    }
  }

  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role as 'TOURIST',
  })

  return {
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
      },
      token,
    },
  }
}

export const registerAgency = async (data: {
  email: string
  password: string
  name: string
  agencyName: string
  contactEmail: string
  contactPhone: string
  description?: string
  address?: string
  city?: string
}): Promise<ApiResponse> => {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  })

  if (existingUser) {
    return {
      success: false,
      error: {
        code: 'USER_EXISTS',
        message: 'User with this email already exists',
      },
    }
  }

  // Hash password
  const hashedPassword = await hashPassword(data.password)

  // Create user
  const user = await prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      name: data.name,
      role: 'AGENCY',
    },
  })

  // Create agency profile
  const agency = await prisma.agency.create({
    data: {
      userId: user.id,
      agencyName: data.agencyName,
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone,
      description: data.description,
      address: data.address,
      city: data.city,
      country: 'Pakistan',
    },
  })

  // Generate token
  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role as 'AGENCY',
  })

  return {
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      agency: {
        id: agency.id,
        agencyName: agency.agencyName,
      },
      token,
    },
  }
}

export const loginAgency = async (email: string, password: string): Promise<ApiResponse> => {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { agencyProfile: true },
  })

  if (!user || user.role !== 'AGENCY') {
    return {
      success: false,
      error: {
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      },
    }
  }

  const isPasswordValid = await comparePassword(password, user.password)
  if (!isPasswordValid) {
    return {
      success: false,
      error: {
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      },
    }
  }

  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role as 'AGENCY',
  })

  return {
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      agency: user.agencyProfile ? {
        id: user.agencyProfile.id,
        agencyName: user.agencyProfile.agencyName,
      } : null,
      token,
    },
  }
}

export const getMe = async (userId: string): Promise<ApiResponse> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      touristProfile: true,
      agencyProfile: true,
    },
  })

  if (!user) {
    return {
      success: false,
      error: {
        code: 'USER_NOT_FOUND',
        message: 'User not found',
      },
    }
  }

  return {
    success: true,
    data: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar,
      touristProfile: user.touristProfile,
      agencyProfile: user.agencyProfile,
    },
  }
}
