import { Router } from 'express'
import * as aiController from '../controllers/ai.controller'
import { authenticate, requireRole } from '../middleware/auth.middleware'

const router = Router()

router.post('/chat', authenticate, requireRole(['TOURIST']), aiController.chat)
router.post('/recommend', authenticate, requireRole(['TOURIST']), aiController.recommend)
router.post('/book', authenticate, requireRole(['TOURIST']), aiController.book)

export default router
