import { Request, Response } from 'express'
import * as packageService from '../services/package.service'

export const getAllPackages = async (req: Request, res: Response) => {
  try {
    const result = await packageService.getAllPackages(req.query)
    res.status(200).json(result)
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

export const getPackageById = async (req: Request, res: Response) => {
  try {
    const result = await packageService.getPackageById(req.params.id)
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

export const createPackage = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'AGENCY') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Only agencies can create packages',
        },
      })
    }

    // Get agency ID from user
    const prisma = (await import('../config/database')).default
    const agency = await prisma.agency.findUnique({
      where: { userId: req.user.userId },
    })

    if (!agency) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Agency profile not found',
        },
      })
    }

    const result = await packageService.createPackage(agency.id, req.body)
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

export const updatePackage = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'AGENCY') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Only agencies can update packages',
        },
      })
    }

    const prisma = (await import('../config/database')).default
    const agency = await prisma.agency.findUnique({
      where: { userId: req.user.userId },
    })

    if (!agency) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Agency profile not found',
        },
      })
    }

    const result = await packageService.updatePackage(req.params.id, agency.id, req.body)
    const statusCode = result.success ? 200 : result.error?.code === 'NOT_FOUND' ? 404 : 403
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

export const deletePackage = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'AGENCY') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Only agencies can delete packages',
        },
      })
    }

    const prisma = (await import('../config/database')).default
    const agency = await prisma.agency.findUnique({
      where: { userId: req.user.userId },
    })

    if (!agency) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Agency profile not found',
        },
      })
    }

    const result = await packageService.deletePackage(req.params.id, agency.id)
    const statusCode = result.success ? 200 : result.error?.code === 'NOT_FOUND' ? 404 : 403
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

export const getAgencyPackages = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'AGENCY') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Only agencies can access this',
        },
      })
    }

    const prisma = (await import('../config/database')).default
    const agency = await prisma.agency.findUnique({
      where: { userId: req.user.userId },
    })

    if (!agency) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Agency profile not found',
        },
      })
    }

    const result = await packageService.getAgencyPackages(agency.id)
    res.status(200).json(result)
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

export const searchPackages = async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string
    if (!query) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Search query is required',
        },
      })
    }

    const result = await packageService.searchPackages(query)
    res.status(200).json(result)
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
