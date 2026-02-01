import { Router } from 'express'
import * as authController from '../controllers/auth.controller'
import { authenticate } from '../middleware/auth.middleware'
import { validate } from '../middleware/validation.middleware'
import {
  registerUserSchema,
  loginUserSchema,
  registerAgencySchema,
  loginAgencySchema,
} from '../validators/auth.validator'
import { authLimiter } from '../middleware/rateLimiter.middleware'

const router = Router()

// User routes
router.post('/user/register', authLimiter, validate(registerUserSchema), authController.registerUser)
router.post('/user/login', authLimiter, validate(loginUserSchema), authController.loginUser)

// Agency routes
router.post('/agency/register', authLimiter, validate(registerAgencySchema), authController.registerAgency)
router.post('/agency/login', authLimiter, validate(loginAgencySchema), authController.loginAgency)

// Common routes
router.post('/logout', authenticate, authController.logout)
router.get('/me', authenticate, authController.getMe)

export default router
