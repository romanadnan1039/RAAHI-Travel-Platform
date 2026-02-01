import prisma from '../config/database'
import { ApiResponse } from '../types'

export const createReview = async (userId: string, data: any): Promise<ApiResponse> => {
  // Check if user already reviewed this package
  const existingReview = await prisma.review.findUnique({
    where: {
      userId_packageId: {
        userId,
        packageId: data.packageId,
      },
    },
  })

  if (existingReview) {
    return {
      success: false,
      error: {
        code: 'REVIEW_EXISTS',
        message: 'You have already reviewed this package',
      },
    }
  }

  const review = await prisma.review.create({
    data: {
      userId,
      packageId: data.packageId,
      rating: data.rating,
      comment: data.comment,
      images: data.images || [],
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
    },
  })

  // Update package rating
  const package_ = await prisma.package.findUnique({
    where: { id: data.packageId },
  })

  if (package_) {
    const reviews = await prisma.review.findMany({
      where: { packageId: data.packageId },
    })
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length

    await prisma.package.update({
      where: { id: data.packageId },
      data: {
        rating: avgRating,
        totalReviews: reviews.length,
      },
    })
  }

  return {
    success: true,
    data: review,
  }
}

export const getPackageReviews = async (packageId: string): Promise<ApiResponse> => {
  const reviews = await prisma.review.findMany({
    where: { packageId },
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
  })

  return {
    success: true,
    data: reviews,
  }
}

export const updateReview = async (id: string, userId: string, data: any): Promise<ApiResponse> => {
  const review = await prisma.review.findUnique({
    where: { id },
  })

  if (!review || review.userId !== userId) {
    return {
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Review not found or unauthorized',
      },
    }
  }

  const updatedReview = await prisma.review.update({
    where: { id },
    data: {
      rating: data.rating,
      comment: data.comment,
      images: data.images,
    },
  })

  return {
    success: true,
    data: updatedReview,
  }
}

export const deleteReview = async (id: string, userId: string): Promise<ApiResponse> => {
  const review = await prisma.review.findUnique({
    where: { id },
  })

  if (!review || review.userId !== userId) {
    return {
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Review not found or unauthorized',
      },
    }
  }

  await prisma.review.delete({
    where: { id },
  })

  return {
    success: true,
    message: 'Review deleted successfully',
  }
}

export const markReviewHelpful = async (id: string): Promise<ApiResponse> => {
  const review = await prisma.review.findUnique({
    where: { id },
  })

  if (!review) {
    return {
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Review not found',
      },
    }
  }

  const updatedReview = await prisma.review.update({
    where: { id },
    data: {
      helpfulCount: review.helpfulCount + 1,
    },
  })

  return {
    success: true,
    data: updatedReview,
  }
}
