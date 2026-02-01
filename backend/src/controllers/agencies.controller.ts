import { Request, Response } from 'express'
import * as agencyService from '../services/agency.service'
import prisma from '../config/database'

export const getAllAgencies = async (req: Request, res: Response) => {
  try {
    const result = await agencyService.getAllAgencies()
    res.status(200).json(result)
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message },
    })
  }
}

export const getAgencyById = async (req: Request, res: Response) => {
  try {
    const result = await agencyService.getAgencyById(req.params.id)
    const statusCode = result.success ? 200 : 404
    res.status(statusCode).json(result)
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message },
    })
  }
}

export const getAgencyPackages = async (req: Request, res: Response) => {
  try {
    const agency = await prisma.agency.findUnique({
      where: { id: req.params.id },
    })

    if (!agency) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Agency not found' },
      })
    }

    const packages = await prisma.package.findMany({
      where: {
        agencyId: agency.id,
        isActive: true,
      },
    })

    res.status(200).json({
      success: true,
      data: packages,
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message },
    })
  }
}

export const getAgencyProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      })
    }

    const result = await agencyService.getAgencyProfile(req.user.userId)
    const statusCode = result.success ? 200 : 404
    res.status(statusCode).json(result)
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message },
    })
  }
}

export const updateAgencyProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      })
    }

    const result = await agencyService.updateAgencyProfile(req.user.userId, req.body)
    const statusCode = result.success ? 200 : 404
    res.status(statusCode).json(result)
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message },
    })
  }
}

export const getAgencyStats = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      })
    }

    const result = await agencyService.getAgencyStats(req.user.userId)
    const statusCode = result.success ? 200 : 404
    res.status(statusCode).json(result)
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message },
    })
  }
}
