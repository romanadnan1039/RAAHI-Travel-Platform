import express, { Express, Request, Response } from 'express'
import { processTravelQuery } from './agent/travelAgent'
import { createBooking } from './services/apiClient'

const app: Express = express()
const PORT = process.env.PORT || 5001

app.use(express.json())

app.post('/chat', async (req: Request, res: Response) => {
  try {
    const { message, conversationId, token } = req.body

    if (!message) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Message is required',
        },
      })
    }

    const result = await processTravelQuery(message)

    res.json({
      success: true,
      data: {
        response: result.response,
        recommendations: result.recommendations,
        conversationId: conversationId || `conv_${Date.now()}`,
      },
    })
  } catch (error: any) {
    console.error('Chat error:', error)
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message || 'An error occurred',
      },
    })
  }
})

app.post('/recommend', async (req: Request, res: Response) => {
  try {
    const { query } = req.body

    if (!query) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Query is required',
        },
      })
    }

    const result = await processTravelQuery(query)

    res.json({
      success: true,
      data: result.recommendations,
    })
  } catch (error: any) {
    console.error('Recommend error:', error)
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message || 'An error occurred',
      },
    })
  }
})

app.post('/book', async (req: Request, res: Response) => {
  try {
    const { packageId, travelers, bookingDate, specialRequests, token } = req.body

    if (!packageId || !token) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Package ID and token are required',
        },
      })
    }

    const result = await createBooking(
      {
        packageId,
        travelers: travelers || 1,
        bookingDate: bookingDate || new Date().toISOString(),
        specialRequests,
      },
      token
    )

    res.json(result)
  } catch (error: any) {
    console.error('Book error:', error)
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message || 'An error occurred',
      },
    })
  }
})

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.listen(PORT, () => {
  console.log(`AI Agent server running on port ${PORT}`)
})
