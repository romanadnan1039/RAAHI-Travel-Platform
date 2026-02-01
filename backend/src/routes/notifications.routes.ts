import { Router } from 'express'
import * as notificationController from '../controllers/notifications.controller'
import { authenticate, requireRole } from '../middleware/auth.middleware'

const router = Router()

router.get('/', authenticate, requireRole(['AGENCY']), notificationController.getNotifications)
router.get('/unread', authenticate, requireRole(['AGENCY']), notificationController.getUnreadNotifications)
router.put('/:id/read', authenticate, requireRole(['AGENCY']), notificationController.markAsRead)
router.put('/read-all', authenticate, requireRole(['AGENCY']), notificationController.markAllAsRead)
router.delete('/:id', authenticate, requireRole(['AGENCY']), notificationController.deleteNotification)
router.get('/count', authenticate, requireRole(['AGENCY']), notificationController.getUnreadCount)

export default router
