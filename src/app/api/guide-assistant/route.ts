import { NextResponse } from 'next/server'
import { generateText } from 'ai'
import { GUIDE_SYSTEM_PROMPT } from '@/lib/guideAssistant'

const MODEL = 'openai/gpt-4o-mini'

export async function POST(req: Request) {
  try {
    const body = await req.json() as { input?: string }
    const userInput = body.input

    if (!userInput || typeof userInput !== 'string') {
      return NextResponse.json(
        { error: 'Invalid input' },
        { status: 400 },
      )
    }

    // Check if OpenAI API key is available
    const hasOpenAI = !!process.env.OPENAI_API_KEY

    if (!hasOpenAI) {
      // Return keyword-based fallback
      return NextResponse.json({
        module: 'RAAH',
        action: 'general_guidance',
        steps: [
          'Step 1: Apna sawal bolein ya likhein',
          'Step 2: Main samajh kar jawab dunga',
          'Step 3: Agar zarurat ho to aur modules suggest karunga',
        ],
        message: 'Main aapki madad ke liye yahan hoon. Kya madad chahiye?',
      })
    }

    // Call LLM for intelligent routing
    const result = await generateText({
      model: MODEL,
      system: GUIDE_SYSTEM_PROMPT,
      prompt: `User input: "${userInput}"\n\nAnalyze this and return ONLY valid JSON with module, action, steps, and message.`,
      temperature: 0.3,
    })

    const responseText = result.text?.trim() ?? ''

    // Try to parse JSON from response
    let guideResponse
    try {
      // Extract JSON if wrapped in markdown code blocks
      const jsonMatch = responseText.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/)
      const jsonText = jsonMatch ? jsonMatch[1] : responseText
      
      guideResponse = JSON.parse(jsonText)
    } catch (parseError) {
      console.error('Failed to parse guide response:', parseError)
      
      // Fallback response
      return NextResponse.json({
        module: 'RAAH',
        action: 'general_guidance',
        steps: [
          'Step 1: Apna sawal dobara bolein',
          'Step 2: Main samajhne ki koshish karunga',
          'Step 3: Aapko sahi jagah guide karunga',
        ],
        message: 'Main aapki madad karna chahta hoon. Thoda aur detail mein batayein?',
      })
    }

    // Validate response structure
    if (
      !guideResponse.module ||
      !guideResponse.action ||
      !Array.isArray(guideResponse.steps) ||
      !guideResponse.message
    ) {
      throw new Error('Invalid guide response structure')
    }

    return NextResponse.json(guideResponse)
  } catch (error) {
    console.error('Guide assistant error:', error)

    return NextResponse.json(
      {
        module: 'RAAH',
        action: 'general_guidance',
        steps: [
          'Step 1: Apna sawal bolein',
          'Step 2: Main jawab dunga',
          'Step 3: Zarurat ho to guide karunga',
        ],
        message: 'Main aapki madad ke liye yahan hoon.',
      },
      { status: 200 }, // Return 200 with fallback instead of error
    )
  }
}
