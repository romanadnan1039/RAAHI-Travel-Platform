import { createServer } from 'http'
import app from './app'
import { config } from './config/env'
import { logger } from './utils/logger.util'
import { initializeSocket } from './config/socket'
import { runMigrations } from './migrate'

const httpServer = createServer(app)
initializeSocket(httpServer)

// Run migrations on startup in production
if (config.nodeEnv === 'production') {
  runMigrations().catch(err => {
    logger.error('Failed to run migrations on startup:', err)
  })
}

const server = httpServer.listen(config.port, () => {
  logger.info(`Server running on port ${config.port}`)
  logger.info(`Environment: ${config.nodeEnv}`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server')
  server.close(() => {
    logger.info('HTTP server closed')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server')
  server.close(() => {
    logger.info('HTTP server closed')
    process.exit(0)
  })
})
