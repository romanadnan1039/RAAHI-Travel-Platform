import { Server as HTTPServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import { verifyToken } from '../utils/jwt.util'

let io: SocketIOServer | null = null

export const initializeSocket = (httpServer: HTTPServer) => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true,
    },
  })

  io.use((socket, next) => {
    const token = socket.handshake.auth.token
    if (!token) {
      return next(new Error('Authentication error'))
    }

    try {
      const payload = verifyToken(token)
      socket.data.user = payload
      next()
    } catch (error) {
      next(new Error('Authentication error'))
    }
  })

  io.on('connection', (socket) => {
    console.log('User connected:', socket.data.user?.userId)

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.data.user?.userId)
    })
  })

  return io
}

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized')
  }
  return io
}

export const emitNotification = (agencyId: string, notification: any) => {
  if (io) {
    io.emit(`agency:${agencyId}:notification`, notification)
  }
}
