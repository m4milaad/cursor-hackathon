import { NextResponse } from 'next/server'
import { generateText } from 'ai'

const MODEL = 'openai/gpt-4o-mini'

export async function POST(req: Request) {
  let form: FormData
  try {
    form = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid form' }, { status: 400 })
  }

  const file = form.get('file')
  
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: 'Missing image file' }, { status: 400 })
  }

  try {
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
    
    // Create a short summary for the mandiHint (market context)
    // In production, this would come from a real market data API
    const mandiHint = 'Check local mandi for current prices. Sopore, Baramulla, and Srinagar markets have regular updates.'

    return NextResponse.json({
      summary: fullText,
      mandiHint,
      success: true,
    })
  } catch (error) {
    console.error('Vision analysis error', error)
    
    // Return demo fallback
    return NextResponse.json({
      summary: 'early_fungal_spots',
      mandiHint: 'Sopore mandi - apple ~Rs.42/kg (demo)',
      success: false,
      demo: true,
    })
  }
}
