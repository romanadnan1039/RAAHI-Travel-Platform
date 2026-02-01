import { Router } from 'express'
import * as agencyController from '../controllers/agencies.controller'
import { authenticate, requireRole } from '../middleware/auth.middleware'

const router = Router()

router.get('/', agencyController.getAllAgencies)
router.get('/:id', agencyController.getAgencyById)
router.get('/:id/packages', agencyController.getAgencyPackages)
router.get('/profile', authenticate, requireRole(['AGENCY']), agencyController.getAgencyProfile)
router.put('/profile', authenticate, requireRole(['AGENCY']), agencyController.updateAgencyProfile)
router.get('/stats', authenticate, requireRole(['AGENCY']), agencyController.getAgencyStats)

export default router
