import { Router } from 'express'
import * as packageController from '../controllers/packages.controller'
import { authenticate, requireRole } from '../middleware/auth.middleware'
import { validate } from '../middleware/validation.middleware'
import { createPackageSchema, updatePackageSchema } from '../validators/package.validator'

const router = Router()

router.get('/', packageController.getAllPackages)
router.get('/search', packageController.searchPackages)
router.get('/:id', packageController.getPackageById)
router.post('/', authenticate, requireRole(['AGENCY']), validate(createPackageSchema), packageController.createPackage)
router.put('/:id', authenticate, requireRole(['AGENCY']), validate(updatePackageSchema), packageController.updatePackage)
router.delete('/:id', authenticate, requireRole(['AGENCY']), packageController.deletePackage)
router.get('/agency/my-packages', authenticate, requireRole(['AGENCY']), packageController.getAgencyPackages)

export default router
