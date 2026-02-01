import { Request, Response, NextFunction } from 'express'
import { ApiResponse } from '../types'
import { logger } from '../utils/logger.util'

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error('Error:', err)

  const response: ApiResponse = {
    success: false,
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: err.message || 'An unexpected error occurred',
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    },
  }

  const statusCode = err.statusCode || err.status || 500
  res.status(statusCode).json(response)
}

export const notFoundHandler = (req: Request, res: Response) => {
  const response: ApiResponse = {
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
    },
  }
  res.status(404).json(response)
}
