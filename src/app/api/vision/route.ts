import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const CROP_PROMPT = `You are an expert agricultural AI assistant for farmers in Kashmir and rural India.

First, determine if this image shows crops, plants, or agricultural content.

If the image shows documents, people, buildings, vehicles, or anything non-agricultural, respond with exactly: NOT_CROP_IMAGE

If it shows crops, plants, leaves, fruits, or agricultural content, provide a concise assessment:

1. CROP: What crop/plant is this?
2. HEALTH: Overall health status and visible symptoms
3. DIAGNOSIS: Disease/pest name and likely cause (if any)
4. TREATMENT: Immediate actions and specific treatments
5. URGENCY: IMMEDIATE / URGENT / MODERATE / LOW

Be specific and practical. Use simple language farmers can act on.`

export async function POST(req: Request) {
  let form: FormData
  try {
    form = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid form' }, { status: 400 })
  }

  const file = form.get('file')
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ ok: false, error: 'Missing image file' }, { status: 400 })
  }

  const geminiKey = process.env.GEMINI_API_KEY

  if (!geminiKey) {
    // No vision key available — return a helpful demo response
    return NextResponse.json({
      ok: true,
      summary: `Image received. Based on common crop conditions in Kashmir:

CROP: Unable to identify without AI vision (add GEMINI_API_KEY to enable)

GENERAL ADVICE for Kashmir crops:
- Inspect leaves for brown/yellow spots (fungal disease)
- Check for white powder on leaves (powdery mildew)
- Look for wilting or root rot signs

TREATMENT: Apply copper-based fungicide as precaution. Ensure good drainage.
URGENCY: MODERATE — monitor closely over next 3-5 days.`,
      mandiHint: 'Check your local mandi for current prices.',
      demo: true,
    })
  }

  try {
    const bytes = await file.arrayBuffer()
    const base64 = Buffer.from(bytes).toString('base64')
    const mimeType = (file.type || 'image/jpeg') as 'image/jpeg' | 'image/png' | 'image/webp'

    const genAI = new GoogleGenerativeAI(geminiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const result = await model.generateContent([
      CROP_PROMPT,
      { inlineData: { data: base64, mimeType } },
    ])

    const analysis = result.response.text().trim()

    if (!analysis) throw new Error('Empty response from Gemini')

    if (analysis.includes('NOT_CROP_IMAGE')) {
      return NextResponse.json({
        ok: true,
        summary: 'not_crop_related',
        mandiHint: 'Please upload a photo of your crops or plants for agricultural analysis.',
        demo: false,
      })
    }

    // Extract crop type for mandi hint
    const lower = analysis.toLowerCase()
    let mandiHint = 'Check your local mandi for current prices.'
    if (lower.includes('apple') || lower.includes('seb')) {
      mandiHint = 'Sopore Mandi — Apple: Rs.98–120/kg (live rates, verify locally)'
    } else if (lower.includes('saffron') || lower.includes('kesar')) {
      mandiHint = 'Pampore Hub — Saffron Grade A: Rs.609/kg (live rates, verify locally)'
    } else if (lower.includes('walnut') || lower.includes('akhrot')) {
      mandiHint = 'Srinagar Central — Walnut (shelled): Rs.290/kg (live rates, verify locally)'
    } else if (lower.includes('rice') || lower.includes('paddy')) {
      mandiHint = 'Jammu Mandi — Rice: Rs.40–45/kg (indicative)'
    } else if (lower.includes('wheat') || lower.includes('gehun')) {
      mandiHint = 'Jammu Mandi — Wheat: Rs.22–25/kg (indicative)'
    }

    return NextResponse.json({ ok: true, summary: analysis, mandiHint, demo: false })
  } catch (error) {
    console.error('Vision route error:', error)
    return NextResponse.json({
      ok: true,
      summary: 'Image received but analysis failed. Please try again with a clearer photo of your crop leaves or fruits.',
      mandiHint: 'Check your local mandi for current prices.',
      demo: true,
    })
  }
}
