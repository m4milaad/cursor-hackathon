import { NextRequest, NextResponse } from 'next/server'

// Intent detection using keyword matching (demo mode) or OpenAI (production)
export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json()

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      )
    }

    const lowerQuery = query.toLowerCase()

    // Check if OpenAI API key is available
    const hasOpenAI = !!process.env.OPENAI_API_KEY

    let intent: 'samjho' | 'zameen' | 'taleem' | 'raah' | 'unknown' = 'unknown'
    let confidence = 0

    if (hasOpenAI) {
      // Production mode: Use OpenAI for intent detection
      const result = await detectIntentWithOpenAI(query)
      intent = result.intent
      confidence = result.confidence
    } else {
      // Demo mode: Use keyword matching
      const result = detectIntentWithKeywords(lowerQuery)
      intent = result.intent
      confidence = result.confidence
    }

    // Map intent to route
    const routeMap: Record<string, string> = {
      samjho: '/samjho',
      zameen: '/zameen',
      taleem: '/taleem',
      raah: '/raah',
      unknown: '/raah', // Default to Raah for unknown intents
    }

    return NextResponse.json({
      intent,
      confidence,
      query,
      route: routeMap[intent],
      mode: hasOpenAI ? 'production' : 'demo',
    })
  } catch (error) {
    console.error('Intent detection error:', error)
    return NextResponse.json(
      { error: 'Failed to detect intent' },
      { status: 500 }
    )
  }
}

// Keyword-based intent detection (demo mode)
function detectIntentWithKeywords(query: string): { intent: 'samjho' | 'zameen' | 'taleem' | 'raah' | 'unknown'; confidence: number } {
  // Agriculture keywords (Zameen)
  const agricultureKeywords = [
    'fasal', 'crop', 'kheti', 'farming', 'seb', 'apple', 'kesar', 'saffron',
    'chawal', 'rice', 'gehun', 'wheat', 'bimari', 'disease', 'kharab',
    'mandi', 'price', 'bechna', 'sell', 'zameen', 'khad', 'fertilizer',
    'pani', 'water', 'barish', 'rain', 'mausam', 'weather', 'patta', 'leaf',
    'darakht', 'tree', 'beej', 'seed'
  ]

  // Career/Education keywords (Taleem)
  const careerKeywords = [
    'naukri', 'job', 'kaam', 'work', 'cv', 'resume', 'skill', 'hunar',
    'taleem', 'education', 'padhai', 'study', 'exam', 'imtihan',
    'scholarship', 'wazifa', 'course', 'training', 'seekhna', 'learn',
    'designer', 'engineer', 'teacher', 'doctor', 'business', 'karobar',
    'rozgar', 'employment', 'interview'
  ]

  // Document/Understanding keywords (Samjho)
  const documentKeywords = [
    'kagaz', 'document', 'notice', 'ittila', 'certificate', 'sanad',
    'samjho', 'samajh', 'understand', 'explain', 'batao', 'kya hai',
    'matlab', 'meaning', 'translate', 'tarjuma', 'read', 'parho',
    'likha', 'written', 'form', 'application', 'darkhwast'
  ]

  // Life guidance keywords (Raah)
  const guidanceKeywords = [
    'raah', 'path', 'rasta', 'confused', 'pareshan', 'help', 'madad',
    'kya karu', 'what should', 'advice', 'mashwara', 'guidance', 'rahnumai',
    'problem', 'mushkil', 'tension', 'stress', 'udas', 'sad', 'khush',
    'future', 'mustaqbil', 'zindagi', 'life', 'scheme', 'yojana',
    'pm kisan', 'mudra', 'loan', 'qarz'
  ]

  // Count matches for each category
  const scores = {
    zameen: agricultureKeywords.filter(kw => query.includes(kw)).length,
    taleem: careerKeywords.filter(kw => query.includes(kw)).length,
    samjho: documentKeywords.filter(kw => query.includes(kw)).length,
    raah: guidanceKeywords.filter(kw => query.includes(kw)).length,
  }

  // Find the category with highest score
  const maxScore = Math.max(...Object.values(scores))
  
  if (maxScore === 0) {
    return { intent: 'raah', confidence: 0.5 } // Default to Raah
  }

  const intent = Object.entries(scores).find(([_, score]) => score === maxScore)?.[0] as 'samjho' | 'zameen' | 'taleem' | 'raah'
  const confidence = Math.min(0.95, 0.6 + (maxScore * 0.1)) // Scale confidence based on matches

  return { intent: intent || 'raah', confidence }
}

// OpenAI-based intent detection (production mode)
async function detectIntentWithOpenAI(query: string): Promise<{ intent: 'samjho' | 'zameen' | 'taleem' | 'raah' | 'unknown'; confidence: number }> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an intent classifier for RAASTA AI, a voice-first assistant for Kashmir.

Classify user queries into one of these intents:

1. **samjho** - Document understanding, translation, explanation
   Examples: "What does this notice say?", "Explain this certificate", "Translate this document"

2. **zameen** - Agriculture, crops, farming, mandi prices
   Examples: "My crop is dying", "Apple disease", "Mandi price", "Fertilizer advice"

3. **taleem** - Career, jobs, education, CV, skills, scholarships
   Examples: "I need a job", "Create my CV", "Exam help", "Scholarship information"

4. **raah** - Life guidance, schemes, emotional support, general questions
   Examples: "I'm confused", "PM Kisan scheme", "What should I do?", "I feel lost"

Respond ONLY with a JSON object in this exact format:
{"intent": "samjho|zameen|taleem|raah", "confidence": 0.0-1.0}

Consider:
- Urdu/Hindi/Kashmiri phrases
- Context from Kashmir (local crops: apple, saffron, rice; schemes: PM Kisan, Mudra)
- Voice input may have transcription errors`
          },
          {
            role: 'user',
            content: query
          }
        ],
        temperature: 0.3,
        max_tokens: 50,
      }),
    })

    if (!response.ok) {
      throw new Error('OpenAI API request failed')
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content?.trim()

    if (!content) {
      throw new Error('No response from OpenAI')
    }

    // Parse JSON response
    const result = JSON.parse(content)
    
    return {
      intent: result.intent || 'raah',
      confidence: result.confidence || 0.7,
    }
  } catch (error) {
    console.error('OpenAI intent detection error:', error)
    // Fallback to keyword matching
    return detectIntentWithKeywords(query.toLowerCase())
  }
}
