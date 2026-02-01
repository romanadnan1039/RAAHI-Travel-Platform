import prisma from '../config/database'
import { ApiResponse } from '../types'

export const createBooking = async (userId: string, data: any): Promise<ApiResponse> => {
  try {
    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      console.error(`User not found: ${userId}`)
      return {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'User not found. Please logout and login again.',
        },
      }
    }

    // Verify user is a tourist
    if (user.role !== 'TOURIST') {
      return {
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Only tourists can book packages',
        },
      }
    }

    const package_ = await prisma.package.findUnique({
      where: { id: data.packageId },
      include: { agency: true },
    })

    if (!package_) {
      return {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Package not found',
        },
      }
    }

    if (!package_.isActive) {
      return {
        success: false,
        error: {
          code: 'BAD_REQUEST',
          message: 'This package is not available for booking',
        },
      }
    }

    const travelers = data.travelers || 1
    if (travelers < package_.minTravelers || travelers > package_.maxTravelers) {
      return {
        success: false,
        error: {
          code: 'BAD_REQUEST',
          message: `Number of travelers must be between ${package_.minTravelers} and ${package_.maxTravelers}`,
        },
      }
    }

    const totalAmount = Number(package_.price) * travelers

    // Final verification - ensure all IDs are valid
    console.log('Creating booking with:', {
      userId: user.id,
      packageId: data.packageId,
      agencyId: package_.agencyId,
      travelers,
      totalAmount,
    })

    // Verify package and agency IDs exist
    const packageCheck = await prisma.package.findUnique({
      where: { id: data.packageId },
      select: { id: true, agencyId: true },
    })

    if (!packageCheck) {
      return {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Package not found',
        },
      }
    }

    const agencyCheck = await prisma.agency.findUnique({
      where: { id: packageCheck.agencyId },
      select: { id: true },
    })

    if (!agencyCheck) {
      return {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Agency not found for this package',
        },
      }
    }

    // Use the verified user's ID
    const booking = await prisma.booking.create({
      data: {
        userId: user.id, // Use verified user ID from database
        packageId: packageCheck.id, // Use verified package ID
        agencyId: agencyCheck.id, // Use verified agency ID
        travelers,
        totalAmount,
        bookingDate: new Date(data.bookingDate),
        specialRequests: data.specialRequests,
        status: 'PENDING',
        paymentStatus: 'PENDING',
      },
      include: {
        package: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    // Create notification for agency
    const notification = await prisma.notification.create({
      data: {
        agencyId: package_.agencyId,
        bookingId: booking.id,
        type: 'BOOKING_NEW',
        title: 'New Booking Received',
        message: `You have received a new booking for ${booking.travelers} traveler(s). Total amount: PKR ${totalAmount}`,
        metadata: {
          bookingId: booking.id,
          packageTitle: package_.title,
        },
      },
    })

    // Emit WebSocket notification
    try {
      const { emitNotification } = await import('../config/socket')
      emitNotification(package_.agencyId, notification)
    } catch (error) {
      // Socket might not be initialized, ignore
    }

    return {
      success: true,
      data: booking,
    }
  } catch (error: any) {
    console.error('Booking creation error:', error)
    
    // Handle Prisma foreign key constraint errors
    if (error.code === 'P2003') {
      return {
        success: false,
        error: {
          code: 'INVALID_DATA',
          message: 'Invalid user or package. Please logout and login again, then try booking.',
        },
      }
    }

    // Handle other Prisma errors
    if (error.code && error.code.startsWith('P')) {
      return {
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'Database error occurred. Please try again.',
        },
      }
    }

    throw error
  }
}

export const getUserBookings = async (userId: string): Promise<ApiResponse> => {
  const bookings = await prisma.booking.findMany({
    where: { userId },
    include: {
      package: {
        include: {
          agency: {
            select: {
              id: true,
              agencyName: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return {
    success: true,
    data: bookings,
  }
}

export const getBookingById = async (id: string, userId?: string, agencyId?: string): Promise<ApiResponse> => {
  const where: any = { id }
  if (userId) {
    where.userId = userId
  }
  if (agencyId) {
    where.agencyId = agencyId
  }

  const booking = await prisma.booking.findFirst({
    where,
    include: {
      package: {
        include: {
          agency: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
    },
  })

  if (!booking) {
    return {
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Booking not found',
      },
    }
  }

  return {
    success: true,
    data: booking,
  }
}

export const updateBookingStatus = async (
  id: string,
  agencyId: string,
  status: string
): Promise<ApiResponse> => {
  const booking = await prisma.booking.findUnique({
    where: { id },
  })

  if (!booking || booking.agencyId !== agencyId) {
    return {
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Booking not found or unauthorized',
      },
    }
  }

  const updatedBooking = await prisma.booking.update({
    where: { id },
    data: { status: status as any },
    include: {
      package: true,
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  })

  // Update or create notification
  try {
    const existingNotification = await prisma.notification.findFirst({
      where: { bookingId: id },
    })

    if (existingNotification) {
      await prisma.notification.update({
        where: { id: existingNotification.id },
        data: {
          type: 'BOOKING_UPDATED',
          title: 'Booking Status Updated',
          message: `Booking status has been updated to ${status}`,
          isRead: false,
          readAt: null,
        },
      })
    } else {
      await prisma.notification.create({
        data: {
          agencyId,
          bookingId: id,
          type: 'BOOKING_UPDATED',
          title: 'Booking Status Updated',
          message: `Booking status has been updated to ${status}`,
        },
      })
    }
  } catch (notificationError) {
    console.error('Failed to create/update status notification:', notificationError)
  }

  return {
    success: true,
    data: updatedBooking,
  }
}

export const cancelBooking = async (id: string, userId?: string, agencyId?: string): Promise<ApiResponse> => {
  const where: any = { id }
  if (userId) {
    where.userId = userId
  }
  if (agencyId) {
    where.agencyId = agencyId
  }

  const booking = await prisma.booking.findFirst({ where })

  if (!booking) {
    return {
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Booking not found',
      },
    }
  }

  const updatedBooking = await prisma.booking.update({
    where: { id },
    data: {
      status: 'CANCELLED',
      cancelledAt: new Date(),
    },
  })

  // Update or create notification (bookingId is unique, so we need to handle existing notification)
  try {
    // Try to find existing notification for this booking
    const existingNotification = await prisma.notification.findFirst({
      where: { bookingId: id },
    })

    if (existingNotification) {
      // Update existing notification
      await prisma.notification.update({
        where: { id: existingNotification.id },
        data: {
          type: 'BOOKING_CANCELLED',
          title: 'Booking Cancelled',
          message: 'A booking has been cancelled',
          isRead: false,
          readAt: null,
        },
      })
    } else {
      // Create new notification
      await prisma.notification.create({
        data: {
          agencyId: booking.agencyId,
          bookingId: id,
          type: 'BOOKING_CANCELLED',
          title: 'Booking Cancelled',
          message: 'A booking has been cancelled',
        },
      })
    }
  } catch (notificationError) {
    // If notification fails, log it but don't fail the booking cancellation
    console.error('Failed to create/update cancellation notification:', notificationError)
  }

  return {
    success: true,
    data: updatedBooking,
  }
}

export const getAgencyBookings = async (agencyId: string): Promise<ApiResponse> => {
  const bookings = await prisma.booking.findMany({
    where: { agencyId },
    include: {
      package: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return {
    success: true,
    data: bookings,
  }
}

export const confirmBooking = async (id: string, agencyId: string): Promise<ApiResponse> => {
  return updateBookingStatus(id, agencyId, 'CONFIRMED')
}
