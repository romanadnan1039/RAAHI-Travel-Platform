import prisma from '../config/database'
import { ApiResponse } from '../types'

export const getAllAgencies = async (): Promise<ApiResponse> => {
  const agencies = await prisma.agency.findMany({
    where: { isActive: true },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      _count: {
        select: {
          packages: true,
        },
      },
    },
    orderBy: {
      rating: 'desc',
    },
  })

  return {
    success: true,
    data: agencies,
  }
}

export const getAgencyById = async (id: string): Promise<ApiResponse> => {
  const agency = await prisma.agency.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      packages: {
        where: { isActive: true },
        take: 10,
      },
    },
  })

  if (!agency) {
    return {
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Agency not found',
      },
    }
  }

  return {
    success: true,
    data: agency,
  }
}

export const getAgencyProfile = async (userId: string): Promise<ApiResponse> => {
  const agency = await prisma.agency.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      _count: {
        select: {
          packages: true,
          bookings: true,
        },
      },
    },
  })

  if (!agency) {
    return {
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Agency profile not found',
      },
    }
  }

  return {
    success: true,
    data: agency,
  }
}

export const updateAgencyProfile = async (userId: string, data: any): Promise<ApiResponse> => {
  const agency = await prisma.agency.findUnique({
    where: { userId },
  })

  if (!agency) {
    return {
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Agency profile not found',
      },
    }
  }

  const updatedAgency = await prisma.agency.update({
    where: { userId },
    data: {
      agencyName: data.agencyName,
      description: data.description,
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone,
      address: data.address,
      city: data.city,
      website: data.website,
    },
  })

  return {
    success: true,
    data: updatedAgency,
  }
}

export const getAgencyStats = async (userId: string): Promise<ApiResponse> => {
  const agency = await prisma.agency.findUnique({
    where: { userId },
    include: {
      _count: {
        select: {
          packages: true,
          bookings: true,
        },
      },
    },
  })

  if (!agency) {
    return {
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Agency profile not found',
      },
    }
  }

  const bookings = await prisma.booking.findMany({
    where: { agencyId: agency.id },
  })

  const stats = {
    totalPackages: agency._count.packages,
    totalBookings: agency._count.bookings,
    pendingBookings: bookings.filter((b) => b.status === 'PENDING').length,
    confirmedBookings: bookings.filter((b) => b.status === 'CONFIRMED').length,
    totalRevenue: bookings
      .filter((b) => b.paymentStatus === 'PAID')
      .reduce((sum, b) => sum + Number(b.totalAmount), 0),
    averageRating: agency.rating,
  }

  return {
    success: true,
    data: stats,
  }
}
