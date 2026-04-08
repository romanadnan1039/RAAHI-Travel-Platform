import { Request, Response } from 'express'
import axios from 'axios'
import { logger } from '../utils/logger.util'

const AI_AGENT_URL = process.env.AI_AGENT_URL || 'http://localhost:5001'

function isAgentUnreachable(error: any): boolean {
  const code = error?.code
  return (
    code === 'ECONNREFUSED' ||
    code === 'ETIMEDOUT' ||
    code === 'ECONNABORTED' ||
    code === 'ENOTFOUND' ||
    code === 'EHOSTUNREACH'
  )
}

// Log AI Agent URL on startup
logger.info(`🤖 AI Agent URL configured: ${AI_AGENT_URL}`)

/** Public: whether the AI agent process is reachable (for UI banner). */
export const status = async (_req: Request, res: Response) => {
  try {
    await axios.get(`${AI_AGENT_URL}/health`, { timeout: 4000 })
    return res.json({ success: true, data: { available: true } })
  } catch (error: any) {
    logger.warn(`AI agent health check failed: ${error?.message || error}`)
    return res.json({ success: true, data: { available: false } })
  }
}

export const chat = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      })
    }

    const token = req.headers.authorization?.replace('Bearer ', '') || ''

    logger.info(`📤 Sending chat request to AI Agent: ${AI_AGENT_URL}/chat`)
    
    const response = await axios.post(`${AI_AGENT_URL}/chat`, {
      message: req.body.message,
      conversationId: req.body.conversationId,
      token,
    }, {
      timeout: 30000, // 30 second timeout
    })

    logger.info(`📥 Received response from AI Agent`)
    res.json(response.data)
  } catch (error: any) {
    logger.error(`❌ AI chat error:`, error.message)
    
    if (isAgentUnreachable(error)) {
      return res.status(503).json({
        success: false,
        error: {
          code: 'SERVICE_UNAVAILABLE',
          message: 'AI service is currently unavailable. Please try again later.',
        },
      })
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.response?.data?.error?.message || error.message || 'AI service error',
      },
    })
  }
}

export const recommend = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      })
    }

    logger.info(`📤 Sending recommend request to AI Agent`)
    
    const response = await axios.post(`${AI_AGENT_URL}/recommend`, {
      query: req.body.query,
    }, {
      timeout: 30000,
    })

    logger.info(`📥 Received recommendations from AI Agent`)
    res.json(response.data)
  } catch (error: any) {
    logger.error(`❌ AI recommend error:`, error.message)
    
    if (isAgentUnreachable(error)) {
      return res.status(503).json({
        success: false,
        error: {
          code: 'SERVICE_UNAVAILABLE',
          message: 'AI service is currently unavailable. Please try again later.',
        },
      })
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.response?.data?.error?.message || error.message || 'AI service error',
      },
    })
  }
}

export const book = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      })
    }

    const token = req.headers.authorization?.replace('Bearer ', '') || ''

    const response = await axios.post(`${AI_AGENT_URL}/book`, {
      ...req.body,
      token,
    })

    res.json(response.data)
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.response?.data?.error?.message || error.message || 'AI service error',
      },
    })
  }
}
