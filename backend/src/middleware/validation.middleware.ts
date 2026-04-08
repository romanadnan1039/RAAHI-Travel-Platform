import { Request, Response, NextFunction } from 'express'
import { ZodSchema, ZodError } from 'zod'
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
    } catch (error: unknown) {
      const issues = error instanceof ZodError ? error.issues : []
      const first = issues[0]
      const hint = first
        ? `${first.path.length ? first.path.join('.') + ': ' : ''}${first.message}`
        : 'Invalid request data'
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: issues.length ? hint : 'Validation failed',
          details: issues,
        },
      }
      return res.status(400).json(response)
    }
  }
}
