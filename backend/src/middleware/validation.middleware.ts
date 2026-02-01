import { Request, Response, NextFunction } from 'express'
import { ZodSchema } from 'zod'
import { ApiResponse } from '../types'

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      })
      next()
    } catch (error: any) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: error.errors,
        },
      }
      return res.status(400).json(response)
    }
  }
}
