import { Router } from 'express'
import * as bookingController from '../controllers/bookings.controller'
import { authenticate, requireRole } from '../middleware/auth.middleware'

const router = Router()

router.post('/', authenticate, requireRole(['TOURIST']), bookingController.createBooking)
router.get('/', authenticate, requireRole(['TOURIST']), bookingController.getUserBookings)
router.get('/:id', authenticate, bookingController.getBookingById)
router.put('/:id/status', authenticate, requireRole(['AGENCY']), bookingController.updateBookingStatus)
router.post('/:id/cancel', authenticate, bookingController.cancelBooking)
router.get('/agency/my-bookings', authenticate, requireRole(['AGENCY']), bookingController.getAgencyBookings)
router.post('/:id/confirm', authenticate, requireRole(['AGENCY']), bookingController.confirmBooking)

export default router
