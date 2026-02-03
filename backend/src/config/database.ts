import { PrismaClient } from '@prisma/client'

// Debug: Log DATABASE_URL status (not the actual value for security)
console.log('=== DATABASE CONNECTION DEBUG ===')
console.log('NODE_ENV:', process.env.NODE_ENV)
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL)
console.log('DATABASE_URL length:', process.env.DATABASE_URL?.length || 0)
console.log('DATABASE_URL starts with postgresql:', process.env.DATABASE_URL?.startsWith('postgresql://') || false)
console.log('================================')

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

export default prisma
