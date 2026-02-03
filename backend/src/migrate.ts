#!/usr/bin/env node
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

async function runMigrations() {
  console.log('🔄 Running database migrations...')
  
  try {
    // Run Prisma migrations
    const { stdout, stderr } = await execAsync('npx prisma migrate deploy')
    console.log(stdout)
    if (stderr) console.error(stderr)
    console.log('✅ Database migrations completed successfully!')
    
    // Run seed (optional - comment out if you don't want auto-seeding)
    console.log('🌱 Seeding database...')
    const seedResult = await execAsync('npx tsx prisma/seed.ts')
    console.log(seedResult.stdout)
    console.log('✅ Database seeded successfully!')
    
  } catch (error: any) {
    console.error('❌ Migration error:', error.message)
    // Don't exit - let the app start anyway
    console.log('⚠️  App will continue without migrations')
  }
}

// Only run if this is the main module
if (require.main === module) {
  runMigrations().then(() => {
    console.log('✅ Migration script completed')
  })
}

export { runMigrations }
