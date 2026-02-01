import { Request, Response } from 'express'
import * as notificationService from '../services/notification.service'
import prisma from '../config/database'

export const getNotifications = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'AGENCY') {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Only agencies can access notifications' },
      })
    }

    const agency = await prisma.agency.findUnique({
      where: { userId: req.user.userId },
    })

    if (!agency) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Agency profile not found' },
      })
    }

    const result = await notificationService.getAgencyNotifications(agency.id)
    res.status(200).json(result)
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message },
    })
  }
}

export const getUnreadNotifications = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'AGENCY') {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Only agencies can access notifications' },
      })
    }

    const agency = await prisma.agency.findUnique({
      where: { userId: req.user.userId },
    })

    if (!agency) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Agency profile not found' },
      })
    }

    const result = await notificationService.getUnreadNotifications(agency.id)
    res.status(200).json(result)
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message },
    })
  }
}

export const markAsRead = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'AGENCY') {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Only agencies can mark notifications as read' },
      })
    }

    const agency = await prisma.agency.findUnique({
      where: { userId: req.user.userId },
    })

    if (!agency) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Agency profile not found' },
      })
    }

    const result = await notificationService.markNotificationAsRead(req.params.id, agency.id)
    const statusCode = result.success ? 200 : 404
    res.status(statusCode).json(result)
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message },
    })
  }
}

export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'AGENCY') {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Only agencies can mark notifications as read' },
      })
    }

    const agency = await prisma.agency.findUnique({
      where: { userId: req.user.userId },
    })

    if (!agency) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Agency profile not found' },
      })
    }

    const result = await notificationService.markAllNotificationsAsRead(agency.id)
    res.status(200).json(result)
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message },
    })
  }
}

export const deleteNotification = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'AGENCY') {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Only agencies can delete notifications' },
      })
    }

    const agency = await prisma.agency.findUnique({
      where: { userId: req.user.userId },
    })

    if (!agency) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Agency profile not found' },
      })
    }

    const result = await notificationService.deleteNotification(req.params.id, agency.id)
    const statusCode = result.success ? 200 : 404
    res.status(statusCode).json(result)
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message },
    })
  }
}

export const getUnreadCount = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'AGENCY') {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Only agencies can access notification count' },
      })
    }

    const agency = await prisma.agency.findUnique({
      where: { userId: req.user.userId },
    })

    if (!agency) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Agency profile not found' },
      })
    }

    const result = await notificationService.getUnreadCount(agency.id)
    res.status(200).json(result)
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message },
    })
  }
}
