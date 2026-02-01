import { Request, Response } from 'express'
import * as bookingService from '../services/booking.service'
import prisma from '../config/database'

export const createBooking = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      })
    }

    // Double-check user exists in database
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
    })

    if (!user) {
      console.error(`User not found in database: ${req.user.userId}`)
      return res.status(401).json({
        success: false,
        error: { 
          code: 'UNAUTHORIZED', 
          message: 'User account not found. Please logout and login again.' 
        },
      })
    }

    // Verify user role
    if (user.role !== 'TOURIST') {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Only tourists can book packages' },
      })
    }

    // Use the verified user ID from database
    const result = await bookingService.createBooking(user.id, req.body)
    const statusCode = result.success ? 201 : 400
    res.status(statusCode).json(result)
  } catch (error: any) {
    console.error('Booking creation error:', error)
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      meta: error.meta,
      userId: req.user?.userId,
    })
    
    // Handle Prisma foreign key constraint errors
    if (error.code === 'P2003') {
      const field = error.meta?.field_name || 'unknown'
      console.error(`Foreign key constraint violation on field: ${field}`)
      
      if (field.includes('userId')) {
        return res.status(401).json({
          success: false,
          error: { 
            code: 'INVALID_USER', 
            message: 'Your account is not valid. Please logout and login again.' 
          },
        })
      }
      
      return res.status(400).json({
        success: false,
        error: { 
          code: 'INVALID_DATA', 
          message: 'Invalid user or package. Please refresh and try again.' 
        },
      })
    }
    
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message || 'An error occurred while creating booking' },
    })
  }
}

export const getUserBookings = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      })
    }

    const result = await bookingService.getUserBookings(req.user.userId)
    res.status(200).json(result)
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message },
    })
  }
}

export const getBookingById = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      })
    }

    let agencyId
    if (req.user.role === 'AGENCY') {
      const agency = await prisma.agency.findUnique({
        where: { userId: req.user.userId },
      })
      agencyId = agency?.id
    }

    const result = await bookingService.getBookingById(
      req.params.id,
      req.user.role === 'TOURIST' ? req.user.userId : undefined,
      agencyId
    )
    const statusCode = result.success ? 200 : 404
    res.status(statusCode).json(result)
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message },
    })
  }
}

export const updateBookingStatus = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'AGENCY') {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Only agencies can update booking status' },
      })
    }

    const agency = await prisma.agency.findUnique({
      where: { userId: req.user.userId },
    })

    if (!agency) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Agency profile not found' },
      })
    }

    const result = await bookingService.updateBookingStatus(
      req.params.id,
      agency.id,
      req.body.status
    )
    const statusCode = result.success ? 200 : 404
    res.status(statusCode).json(result)
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message },
    })
  }
}

export const cancelBooking = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      })
    }

    let agencyId
    if (req.user.role === 'AGENCY') {
      const agency = await prisma.agency.findUnique({
        where: { userId: req.user.userId },
      })
      agencyId = agency?.id
    }

    const result = await bookingService.cancelBooking(
      req.params.id,
      req.user.role === 'TOURIST' ? req.user.userId : undefined,
      agencyId
    )
    const statusCode = result.success ? 200 : 404
    res.status(statusCode).json(result)
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message },
    })
  }
}

export const getAgencyBookings = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'AGENCY') {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Only agencies can access this' },
      })
    }

    const agency = await prisma.agency.findUnique({
      where: { userId: req.user.userId },
    })

    if (!agency) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Agency profile not found' },
      })
    }

    const result = await bookingService.getAgencyBookings(agency.id)
    res.status(200).json(result)
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message },
    })
  }
}

export const confirmBooking = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'AGENCY') {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Only agencies can confirm bookings' },
      })
    }

    const agency = await prisma.agency.findUnique({
      where: { userId: req.user.userId },
    })

    if (!agency) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Agency profile not found' },
      })
    }

    const result = await bookingService.confirmBooking(req.params.id, agency.id)
    const statusCode = result.success ? 200 : 404
    res.status(statusCode).json(result)
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message },
    })
  }
}
