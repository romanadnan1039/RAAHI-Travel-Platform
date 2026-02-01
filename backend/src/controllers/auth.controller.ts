import { Request, Response } from 'express'
import * as authService from '../services/auth.service'

export const registerUser = async (req: Request, res: Response) => {
  try {
    const result = await authService.registerUser(req.body)
    const statusCode = result.success ? 201 : 400
    res.status(statusCode).json(result)
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message,
      },
    })
  }
}

export const loginUser = async (req: Request, res: Response) => {
  try {
    const result = await authService.loginUser(req.body.email, req.body.password)
    const statusCode = result.success ? 200 : 401
    res.status(statusCode).json(result)
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message,
      },
    })
  }
}

export const registerAgency = async (req: Request, res: Response) => {
  try {
    const result = await authService.registerAgency(req.body)
    const statusCode = result.success ? 201 : 400
    res.status(statusCode).json(result)
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message,
      },
    })
  }
}

export const loginAgency = async (req: Request, res: Response) => {
  try {
    const result = await authService.loginAgency(req.body.email, req.body.password)
    const statusCode = result.success ? 200 : 401
    res.status(statusCode).json(result)
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message,
      },
    })
  }
}

export const getMe = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      })
    }

    const result = await authService.getMe(req.user.userId)
    const statusCode = result.success ? 200 : 404
    res.status(statusCode).json(result)
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message,
      },
    })
  }
}

export const logout = async (req: Request, res: Response) => {
  // JWT is stateless, so logout is handled client-side by removing token
  res.json({
    success: true,
    message: 'Logged out successfully',
  })
}
