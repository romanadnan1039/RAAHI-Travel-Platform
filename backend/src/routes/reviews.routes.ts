import { Router } from 'express'
import * as reviewController from '../controllers/reviews.controller'
import { authenticate, requireRole } from '../middleware/auth.middleware'

const router = Router()

router.post('/', authenticate, requireRole(['TOURIST']), reviewController.createReview)
router.get('/package/:packageId', reviewController.getPackageReviews)
router.put('/:id', authenticate, requireRole(['TOURIST']), reviewController.updateReview)
router.delete('/:id', authenticate, requireRole(['TOURIST']), reviewController.deleteReview)
router.post('/:id/helpful', reviewController.markReviewHelpful)

export default router
