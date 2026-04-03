import { NextResponse } from 'next/server'
import { detectIntentWithOpenRouter, isOpenRouterAvailable } from '@/lib/openrouter'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const query = body.query as string

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      )
    }

    // Check if OpenRouter is available
    if (!isOpenRouterAvailable()) {
      return NextResponse.json(
        { 
          error: 'AI service not configured. Add OPENROUTER_API_KEY to .env.local',
          intent: 'raah',
          confidence: 0,
          query,
          route: '/raah'
        },
        { status: 503 }
      )
    }

    // Use OpenRouter for intent detection
    const result = await detectIntentWithOpenRouter(query)

    return NextResponse.json({
      intent: result.intent,
      confidence: result.confidence,
      query,
      route: result.route
    })
  } catch (error) {
    console.error('Intent detection error:', error)
    
    // Fallback to raah on error
    return NextResponse.json({
      intent: 'raah',
      confidence: 0.5,
      query: '',
      route: '/raah',
      error: 'Intent detection failed'
    })
  }
}
