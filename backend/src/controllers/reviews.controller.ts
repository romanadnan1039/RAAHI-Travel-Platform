import { Request, Response } from 'express'
import * as reviewService from '../services/review.service'

export const createReview = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      })
    }

    const result = await reviewService.createReview(req.user.userId, req.body)
    const statusCode = result.success ? 201 : 400
    res.status(statusCode).json(result)
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message },
    })
  }
}

export const getPackageReviews = async (req: Request, res: Response) => {
  try {
    const result = await reviewService.getPackageReviews(req.params.packageId)
    res.status(200).json(result)
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message },
    })
  }
}

export const updateReview = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      })
    }

    const result = await reviewService.updateReview(req.params.id, req.user.userId, req.body)
    const statusCode = result.success ? 200 : 404
    res.status(statusCode).json(result)
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message },
    })
  }
}

export const deleteReview = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      })
    }

    const result = await reviewService.deleteReview(req.params.id, req.user.userId)
    const statusCode = result.success ? 200 : 404
    res.status(statusCode).json(result)
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message },
    })
  }
}

export const markReviewHelpful = async (req: Request, res: Response) => {
  try {
    const result = await reviewService.markReviewHelpful(req.params.id)
    const statusCode = result.success ? 200 : 404
    res.status(statusCode).json(result)
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message },
    })
  }
}
