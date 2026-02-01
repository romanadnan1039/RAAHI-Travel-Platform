import { z } from 'zod'

export const createPackageSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    destination: z.string().min(2, 'Destination is required'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    duration: z.number().int().positive('Duration must be a positive number'),
    price: z.number().positive('Price must be positive'),
    originalPrice: z.number().positive().optional(),
    maxTravelers: z.number().int().positive().default(4),
    minTravelers: z.number().int().positive().default(1),
    includes: z.array(z.string()).default([]),
    excludes: z.array(z.string()).default([]),
    itinerary: z.record(z.any()).optional(),
    images: z.array(z.string()).default([]),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    cancellationPolicy: z.string().optional(),
  }),
})

export const updatePackageSchema = z.object({
  body: z.object({
    title: z.string().min(3).optional(),
    destination: z.string().min(2).optional(),
    description: z.string().min(10).optional(),
    duration: z.number().int().positive().optional(),
    price: z.number().positive().optional(),
    originalPrice: z.number().positive().optional(),
    maxTravelers: z.number().int().positive().optional(),
    minTravelers: z.number().int().positive().optional(),
    includes: z.array(z.string()).optional(),
    excludes: z.array(z.string()).optional(),
    itinerary: z.record(z.any()).optional(),
    images: z.array(z.string()).optional(),
    isActive: z.boolean().optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    cancellationPolicy: z.string().optional(),
  }),
})
