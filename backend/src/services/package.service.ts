import prisma from '../config/database'
import { ApiResponse, PaginatedResponse } from '../types'
import { PAGINATION, SORT_BY, SORT_ORDER } from '../utils/constants'

export const getAllPackages = async (filters: any): Promise<ApiResponse<PaginatedResponse<any>>> => {
  const {
    destination,
    minPrice,
    maxPrice,
    duration,
    minDuration,
    maxDuration,
    minRating,
    agencyId,
    page = PAGINATION.DEFAULT_PAGE,
    limit = PAGINATION.DEFAULT_LIMIT,
    sortBy = SORT_BY.CREATED_AT,
    order = SORT_ORDER.DESC,
  } = filters

  const skip = (Number(page) - 1) * Number(limit)
  const take = Math.min(Number(limit), PAGINATION.MAX_LIMIT)

  const where: any = {
    isActive: true,
  }

  if (destination) {
    where.destination = { contains: destination, mode: 'insensitive' }
  }
  if (minPrice) {
    where.price = { ...where.price, gte: Number(minPrice) }
  }
  if (maxPrice) {
    where.price = { ...where.price, lte: Number(maxPrice) }
  }
  if (duration) {
    where.duration = Number(duration)
  } else {
    if (minDuration || maxDuration) {
      where.duration = {}
      if (minDuration) {
        where.duration.gte = Number(minDuration)
      }
      if (maxDuration) {
        where.duration.lte = Number(maxDuration)
      }
    }
  }
  if (minRating) {
    where.rating = { gte: Number(minRating) }
  }
  if (agencyId) {
    where.agencyId = agencyId
  }

  const [packages, total] = await Promise.all([
    prisma.package.findMany({
      where,
      skip,
      take,
      include: {
        agency: {
          select: {
            id: true,
            agencyName: true,
            rating: true,
            city: true,
          },
        },
      },
      orderBy: {
        [sortBy]: order,
      },
    }),
    prisma.package.count({ where }),
  ])

  return {
    success: true,
    data: {
      data: packages,
      total,
      page: Number(page),
      limit: take,
      totalPages: Math.ceil(total / take),
    },
  }
}

export const getPackageById = async (id: string): Promise<ApiResponse> => {
  const package_ = await prisma.package.findUnique({
    where: { id },
    include: {
      agency: true,
      reviews: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
      },
    },
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

  return {
    success: true,
    data: package_,
  }
}

export const createPackage = async (agencyId: string, data: any): Promise<ApiResponse> => {
  const package_ = await prisma.package.create({
    data: {
      ...data,
      agencyId,
      price: Number(data.price),
      originalPrice: data.originalPrice ? Number(data.originalPrice) : null,
    },
    include: {
      agency: {
        select: {
          id: true,
          agencyName: true,
        },
      },
    },
  })

  return {
    success: true,
    data: package_,
  }
}

export const updatePackage = async (id: string, agencyId: string, data: any): Promise<ApiResponse> => {
  const existingPackage = await prisma.package.findUnique({
    where: { id },
  })

  if (!existingPackage) {
    return {
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Package not found',
      },
    }
  }

  if (existingPackage.agencyId !== agencyId) {
    return {
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'You do not have permission to update this package',
      },
    }
  }

  const package_ = await prisma.package.update({
    where: { id },
    data: {
      ...data,
      price: data.price ? Number(data.price) : undefined,
      originalPrice: data.originalPrice ? Number(data.originalPrice) : undefined,
    },
  })

  return {
    success: true,
    data: package_,
  }
}

export const deletePackage = async (id: string, agencyId: string): Promise<ApiResponse> => {
  try {
    const existingPackage = await prisma.package.findUnique({
      where: { id },
      include: {
        bookings: true,
        reviews: true,
      },
    })

    if (!existingPackage) {
      return {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Package not found',
        },
      }
    }

    if (existingPackage.agencyId !== agencyId) {
      return {
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to delete this package',
        },
      }
    }

    // Delete related data in a transaction
    await prisma.$transaction([
      // Delete all reviews for this package
      prisma.review.deleteMany({
        where: { packageId: id },
      }),
      // Delete all bookings for this package (and their notifications via cascade)
      prisma.booking.deleteMany({
        where: { packageId: id },
      }),
      // Finally delete the package
      prisma.package.delete({
        where: { id },
      }),
    ])

    const bookingCount = existingPackage.bookings.length
    const message = bookingCount > 0 
      ? `Package deleted successfully (${bookingCount} booking(s) cancelled)` 
      : 'Package deleted successfully'

    return {
      success: true,
      message,
    }
  } catch (error: any) {
    console.error('Delete package error:', error)
    return {
      success: false,
      error: {
        code: 'DELETE_FAILED',
        message: error.message || 'Failed to delete package',
      },
    }
  }
}

export const getAgencyPackages = async (agencyId: string): Promise<ApiResponse> => {
  const packages = await prisma.package.findMany({
    where: { agencyId },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return {
    success: true,
    data: packages,
  }
}

export const searchPackages = async (query: string): Promise<ApiResponse> => {
  const packages = await prisma.package.findMany({
    where: {
      isActive: true,
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { destination: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ],
    },
    include: {
      agency: {
        select: {
          id: true,
          agencyName: true,
          rating: true,
        },
      },
    },
    take: 20,
  })

  return {
    success: true,
    data: packages,
  }
}
