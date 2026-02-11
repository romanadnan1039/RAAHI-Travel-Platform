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

    // Use provided conversationId or generate new one
    const convId = conversationId || `conv_${Date.now()}`
    
    const result = await processTravelQuery(message, convId)

    res.json({
      success: true,
      data: {
        response: result.response,
        recommendations: result.recommendations,
        conversationId: result.conversationId,
        parsedQuery: result.parsedQuery, // Include parsed query for debugging
      },
    })
  } catch (error: any) {
    console.error('❌ Chat error:', error)
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
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    features: [
      'Custom NLP Query Parser',
      'Enhanced Recommendation Engine',
      'Multi-language Support (English + Urdu)',
      'Conversation Context Management',
      'Template-based Responses'
    ]
  })
})

app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60))
  console.log('🤖 RAAHI AI Agent v2.0 - Custom Intelligence')
  console.log('='.repeat(60))
  console.log(`✅ Server running on port ${PORT}`)
  console.log('✅ No OpenAI dependency - 100% custom AI')
  console.log('✅ Multi-language support: English + Urdu')
  console.log('✅ Enhanced scoring algorithm')
  console.log('✅ Conversation context tracking')
  console.log('='.repeat(60) + '\n')
})
