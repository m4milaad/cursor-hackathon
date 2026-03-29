import { NextResponse } from 'next/server'
import { generateText } from 'ai'
import { formatMandiPrice, getPriceForCrop, isSupportedCrop } from '@/lib/mandi'
import {
  completeLifecycleRequest,
  createLifecycleRequest,
  failLifecycleRequest,
} from '@/lib/server/convexLifecycle'

const MODEL = 'openai/gpt-4o-mini'

function inferCropType(summary: string): string {
  const text = summary.toLowerCase()
  const candidates = ['apple', 'rice', 'wheat', 'saffron'] as const
  for (const candidate of candidates) {
    if (text.includes(candidate)) return candidate
  }
  return 'apple'
}

export async function POST(req: Request) {
  let requestId: string | null = null
  let form: FormData
  try {
    form = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid form' }, { status: 400 })
  }

  const file = form.get('file')
  
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json(
      { ok: false, error: 'Missing image file', demo: false },
      { status: 400 },
    )
  }

  try {
    requestId = await createLifecycleRequest({
      mode: 'vision',
      locale: 'en',
      input: file.name,
    })

    // Convert file to base64
    const bytes = await file.arrayBuffer()
    const base64 = Buffer.from(bytes).toString('base64')
    const mimeType = file.type || 'image/jpeg'
    const dataUrl = `data:${mimeType};base64,${base64}`

    const systemPrompt = `You are an agricultural expert AI assistant for farmers in Kashmir and rural India. Analyze this crop/plant image and provide:

1. IDENTIFICATION: What crop/plant is this? What part is shown (leaf, fruit, stem)?
2. HEALTH ASSESSMENT: Are there any signs of disease, pest damage, or nutritional deficiency?
3. DIAGNOSIS: If issues are found, what is the likely cause? (e.g., fungal infection, bacterial disease, pest damage, nutrient deficiency)
4. URGENCY: How urgent is treatment needed? (immediate, within days, can wait)

Be concise and practical. Farmers need actionable advice, not academic explanations. Use simple language.`

    const result = await generateText({
      model: MODEL,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: systemPrompt },
            { type: 'image', image: dataUrl },
          ],
        },
      ],
      maxOutputTokens: 1000,
    })

    // Extract a summary for the vision summary field
    const fullText = result.text?.trim() ?? ''
    const cropType = inferCropType(fullText)
    const mandiPrice = isSupportedCrop(cropType)
      ? await getPriceForCrop(cropType, 'kashmir')
      : null
    const mandiHint = mandiPrice
      ? formatMandiPrice(mandiPrice, true)
      : 'No live mandi data right now. Please verify in your nearest mandi.'

    if (requestId) {
      await completeLifecycleRequest(
        requestId,
        `${fullText}\nMarket: ${mandiHint}`,
        'vercel-ai',
      )
    }
    return NextResponse.json({
      ok: true,
      summary: fullText,
      mandiHint,
      demo: false,
      requestId,
    })
  } catch (error) {
    console.error('Vision analysis error', error)
    if (requestId) {
      await failLifecycleRequest(
        requestId,
        error instanceof Error ? error.message : 'Vision analysis failed',
      )
    }
    
    // Return demo fallback
    return NextResponse.json({
      ok: true,
      summary: 'early_fungal_spots',
      mandiHint: 'Sopore mandi - apple ~Rs.42/kg (demo)',
      demo: true,
      requestId,
    })
  }
}
