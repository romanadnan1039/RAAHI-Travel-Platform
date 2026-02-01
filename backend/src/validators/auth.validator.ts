import { z } from 'zod'

export const registerUserSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    phone: z.string().optional(),
  }),
})

export const loginUserSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
})

export const registerAgencySchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    agencyName: z.string().min(2, 'Agency name must be at least 2 characters'),
    contactEmail: z.string().email('Invalid contact email'),
    contactPhone: z.string().min(10, 'Contact phone is required'),
    description: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
  }),
})

export const loginAgencySchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
})
