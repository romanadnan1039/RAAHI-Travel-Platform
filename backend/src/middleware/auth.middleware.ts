import { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../utils/jwt.util'
import { ApiResponse } from '../types'

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'No token provided',
        },
      }
      return res.status(401).json(response)
    }

    const token = authHeader.substring(7)
    const payload = verifyToken(token)
    
    // Verify user still exists in database
    const prisma = (await import('../config/database')).default
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    })

    if (!user) {
      console.error(`Authentication failed: User not found in database. userId: ${payload.userId}`)
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User account not found. Please logout and login again.',
        },
      }
      return res.status(401).json(response)
    }

    // Verify user is active (if you have an isActive field)
    // if (user.isActive === false) {
    //   const response: ApiResponse = {
    //     success: false,
    //     error: {
    //       code: 'UNAUTHORIZED',
    //       message: 'Your account has been deactivated. Please contact support.',
    //     },
    //   }
    //   return res.status(401).json(response)
    // }

    // Update payload with current user data from database
    req.user = {
      userId: user.id, // Use verified user ID from database
      email: user.email,
      role: user.role as 'TOURIST' | 'AGENCY',
    }
    
    console.log(`Authenticated user: ${user.id} (${user.email}) - Role: ${user.role}`)
    
    next()
  } catch (error: any) {
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid or expired token',
      },
    }
    return res.status(401).json(response)
  }
}

export const requireRole = (roles: ('TOURIST' | 'AGENCY')[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      }
      return res.status(401).json(response)
    }

    if (!roles.includes(req.user.role)) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Insufficient permissions',
        },
      }
      return res.status(403).json(response)
    }

    next()
  }
}
