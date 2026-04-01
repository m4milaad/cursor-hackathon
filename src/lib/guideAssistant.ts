/**
 * Guide Assistant System
 * Intelligent routing and step-by-step guidance for voice-first users
 */

export type ModuleName = 'SAMJHO' | 'ZAMEEN' | 'TALEEM' | 'RAAH'

export type ActionType =
  | 'scan_document'
  | 'explain_notice'
  | 'detect_crop'
  | 'check_disease'
  | 'mandi_price'
  | 'find_job'
  | 'create_cv'
  | 'exam_prep'
  | 'scholarship'
  | 'mental_support'
  | 'general_guidance'
  | 'scheme_info'

export interface GuideResponse {
  module: ModuleName
  action: ActionType
  steps: string[]
  message: string
  route?: string // Optional navigation route
}

const GUIDE_SYSTEM_PROMPT = `You are an intelligent AI Guide Assistant for a voice-first application designed for underserved users.

Your job is to:
1. Understand the user's problem (in any language: Urdu, Kashmiri, Hindi, English)
2. Identify the correct module
3. Guide the user step-by-step in simple, clear language

## AVAILABLE MODULES

1. SAMJHO → Documents, notices, certificates, forms
2. ZAMEEN → Crops, farming, diseases, mandi prices
3. TALEEM → Jobs, CV, exams, scholarships, youth support
4. RAAH → General guidance, emotional support, life advice

## TASK FLOW

### Step 1: Intent Detection
Analyze the user input and classify into one module.

Examples:
- "Ye notice kya hai" → SAMJHO
- "Meri fasal kharab hai" → ZAMEEN
- "Mujhe job chahiye" → TALEEM
- "Main pareshan hoon" → RAAH

### Step 2: Auto Navigation Output
Return the module and sub-action.

### Step 3: Step-by-Step Guidance
Provide simple steps in user's language.

Rules:
- Use very simple words
- Max 3–5 steps
- Each step should be actionable
- Avoid technical terms

### Step 4: Tone & Style
- Friendly, supportive, human-like
- No complex sentences
- No technical jargon
- Can mix Hindi/Urdu (Roman Urdu preferred if needed)

### Step 5: Extra Intelligence
- If unclear → ask 1 clarifying question
- If urgent → highlight urgency
- If multiple intents → choose most relevant

## FINAL OUTPUT FORMAT (STRICT)

Return ONLY valid JSON with this exact structure:
{
  "module": "SAMJHO",
  "action": "scan_document",
  "steps": [
    "Step 1: Camera open karein",
    "Step 2: Document ki photo lein",
    "Step 3: Analysis ka wait karein",
    "Step 4: Main aapko simple mein samjha dunga"
  ],
  "message": "Main aapki madad karta hoon. Bas yeh steps follow karein."
}

DO NOT:
- Do not give long explanations
- Do not output paragraphs
- Do not use difficult English
- Do not confuse user

GOAL: Make the user feel "Mujhe bas bolna hai, app sab samajh ke guide kar degi"`

/**
 * Get route path for a module and action
 */
export function getRouteForAction(module: ModuleName, action: ActionType): string {
  switch (module) {
    case 'SAMJHO':
      return '/samjho'
    case 'ZAMEEN':
      return '/zameen'
    case 'TALEEM':
      if (action === 'create_cv') return '/taleem/cv'
      if (action === 'exam_prep') return '/taleem/exam'
      if (action === 'scholarship') return '/taleem/scholarship'
      if (action === 'find_job') return '/taleem/naukri'
      return '/taleem'
    case 'RAAH':
      return '/raah'
    default:
      return '/'
  }
}

/**
 * Call the Guide Assistant API to get intelligent routing and guidance
 */
export async function getGuideAssistance(userInput: string): Promise<GuideResponse> {
  try {
    const response = await fetch('/api/guide-assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: userInput }),
    })

    if (!response.ok) {
      throw new Error('Guide assistant API failed')
    }

    const data = await response.json() as GuideResponse
    
    // Add route to response
    data.route = getRouteForAction(data.module, data.action)
    
    return data
  } catch (error) {
    console.error('Guide assistant error:', error)
    
    // Fallback to RAAH for general guidance
    return {
      module: 'RAAH',
      action: 'general_guidance',
      steps: [
        'Step 1: Apna sawal bolein ya likhein',
        'Step 2: Main samajh kar jawab dunga',
        'Step 3: Agar zarurat ho to aur modules suggest karunga',
      ],
      message: 'Main aapki madad ke liye yahan hoon. Kya madad chahiye?',
      route: '/raah',
    }
  }
}

/**
 * Keyword-based fallback routing (when API is unavailable)
 */
export function getFallbackRoute(userInput: string): GuideResponse {
  const input = userInput.toLowerCase()

  // SAMJHO keywords
  if (
    input.includes('notice') ||
    input.includes('kagaz') ||
    input.includes('document') ||
    input.includes('form') ||
    input.includes('certificate') ||
    input.includes('kya kehta hai') ||
    input.includes('samjho')
  ) {
    return {
      module: 'SAMJHO',
      action: 'scan_document',
      steps: [
        'Step 1: Camera kholen',
        'Step 2: Document ki photo lein',
        'Step 3: Main text padh kar samjha dunga',
      ],
      message: 'Main aapke document ko samajh kar simple mein bataunga.',
      route: '/samjho',
    }
  }

  // ZAMEEN keywords
  if (
    input.includes('fasal') ||
    input.includes('crop') ||
    input.includes('patti') ||
    input.includes('leaf') ||
    input.includes('beemari') ||
    input.includes('disease') ||
    input.includes('mandi') ||
    input.includes('price') ||
    input.includes('zameen') ||
    input.includes('kheti')
  ) {
    return {
      module: 'ZAMEEN',
      action: 'detect_crop',
      steps: [
        'Step 1: Fasal ya patti ki photo lein',
        'Step 2: Main beemari check karunga',
        'Step 3: Ilaj aur mandi price bataunga',
      ],
      message: 'Main aapki fasal ki madad karunga.',
      route: '/zameen',
    }
  }

  // TALEEM keywords
  if (
    input.includes('job') ||
    input.includes('naukri') ||
    input.includes('cv') ||
    input.includes('resume') ||
    input.includes('exam') ||
    input.includes('scholarship') ||
    input.includes('padhai') ||
    input.includes('taleem') ||
    input.includes('career')
  ) {
    return {
      module: 'TALEEM',
      action: 'find_job',
      steps: [
        'Step 1: Taleem section mein jayen',
        'Step 2: Apni zarurat choose karein (Job, CV, Exam, Scholarship)',
        'Step 3: Main step-by-step guide karunga',
      ],
      message: 'Main aapko job aur career mein madad karunga.',
      route: '/taleem',
    }
  }

  // RAAH (default for everything else)
  return {
    module: 'RAAH',
    action: 'general_guidance',
    steps: [
      'Step 1: Apna sawal pura bolein',
      'Step 2: Main samajh kar jawab dunga',
      'Step 3: Zarurat ho to doosre modules suggest karunga',
    ],
    message: 'Main aapki baat sun raha hoon. Kya madad chahiye?',
    route: '/raah',
  }
}

export { GUIDE_SYSTEM_PROMPT }
