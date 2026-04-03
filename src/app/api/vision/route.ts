import { NextResponse } from 'next/server'
import { openai } from '@ai-sdk/openai'
import { generateText } from 'ai'

export async function POST(req: Request) {
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

  // Check if OpenAI API key is available
  const hasOpenAI = !!process.env.OPENAI_API_KEY

  if (!hasOpenAI) {
    // Return demo fallback immediately
    return NextResponse.json({
      ok: true,
      summary: '[Demo Mode] This appears to be a crop with early signs of fungal infection. The leaves show yellowing and brown spots, which are common symptoms of fungal diseases in Kashmir\'s humid climate. Treatment: Apply fungicide within 3-5 days. Remove infected leaves. Improve air circulation around plants.',
      mandiHint: 'Sopore mandi - apple ~Rs.45/kg (demo data)',
      demo: true,
    })
  }

  try {
    // Convert file to base64
    const bytes = await file.arrayBuffer()
    const base64 = Buffer.from(bytes).toString('base64')
    const mimeType = file.type || 'image/jpeg'
    const dataUrl = `data:${mimeType};base64,${base64}`

    const systemPrompt = `You are an expert agricultural AI assistant specializing in crop disease detection for farmers in Kashmir and rural India.

IMPORTANT: First, determine if this image shows crops, plants, or agricultural content.

If the image shows:
- Documents, certificates, papers, text, forms, IDs, or any non-agricultural content
- Buildings, people, vehicles, or other non-plant subjects
- Screenshots, digital content, or computer-generated images

Then respond with EXACTLY: "NOT_CROP_IMAGE"

If the image shows crops, plants, leaves, fruits, vegetables, or agricultural content, then provide a detailed assessment:

1. CROP IDENTIFICATION:
   - What crop/plant is this?
   - What part is shown (leaf, fruit, stem, flower)?
   - Growth stage (seedling, vegetative, flowering, fruiting)?

2. HEALTH ASSESSMENT:
   - Overall health status (healthy, mild issues, moderate issues, severe issues)
   - Visible symptoms (discoloration, spots, wilting, deformities)
   - Affected areas (percentage of plant affected)

3. DISEASE/PEST DIAGNOSIS:
   - Specific disease name (if identifiable)
   - Likely cause (fungal, bacterial, viral, pest, nutrient deficiency, environmental stress)
   - Common name in local context
   - Confidence level in diagnosis

4. TREATMENT RECOMMENDATIONS:
   - Immediate actions needed
   - Specific treatments (fungicides, pesticides, nutrients)
   - Application method and timing
   - Preventive measures

5. URGENCY LEVEL:
   - IMMEDIATE (treat within 24-48 hours)
   - URGENT (treat within 3-5 days)
   - MODERATE (treat within 1-2 weeks)
   - LOW (monitor and take preventive action)

6. ADDITIONAL ADVICE:
   - Cultural practices to improve plant health
   - Environmental factors to consider
   - When to harvest (if applicable)

Be specific, practical, and use simple language that farmers can understand and act upon.
Focus on actionable advice rather than academic explanations.`

    const result = await generateText({
      model: openai('gpt-4o-mini'),
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: systemPrompt },
            { type: 'image', image: dataUrl },
          ],
        },
      ],
      temperature: 0.3, // Balanced for accuracy and detail
    })

    const analysis = result.text?.trim() ?? ''
    
    if (!analysis) {
      throw new Error('No analysis generated from image')
    }
    
    // Check if AI detected non-crop image
    if (analysis.includes('NOT_CROP_IMAGE')) {
      return NextResponse.json({
        ok: true,
        summary: 'not_crop_related',
        mandiHint: 'This does not appear to be a crop or plant image. Please upload a photo of your crops, leaves, or plants for agricultural analysis.',
        demo: false,
      })
    }

    // Extract crop type for mandi price (simple keyword matching)
    const lowerAnalysis = analysis.toLowerCase()
    let mandiHint = 'Check your local mandi for current prices.'
    
    if (lowerAnalysis.includes('apple') || lowerAnalysis.includes('seb')) {
      mandiHint = 'Sopore mandi - Apple Grade A: Rs.45-50/kg, Grade B: Rs.35-40/kg (indicative prices, verify locally)'
    } else if (lowerAnalysis.includes('saffron') || lowerAnalysis.includes('kesar')) {
      mandiHint = 'Pampore market - Saffron Grade A: Rs.2,45,000-2,50,000/kg (indicative prices, verify locally)'
    } else if (lowerAnalysis.includes('rice') || lowerAnalysis.includes('chawal')) {
      mandiHint = 'Srinagar mandi - Rice: Rs.40-45/kg (indicative prices, verify locally)'
    } else if (lowerAnalysis.includes('walnut') || lowerAnalysis.includes('akhrot')) {
      mandiHint = 'Srinagar Central - Walnut (shelled): Rs.800-850/kg (indicative prices, verify locally)'
    }

    return NextResponse.json({
      ok: true,
      summary: analysis,
      mandiHint,
      demo: false,
    })
  } catch (error) {
    console.error('Vision analysis error:', error)
    
    // Return demo fallback on error
    return NextResponse.json({
      ok: true,
      summary: '[Demo Mode] This appears to be a crop with early signs of fungal infection. The leaves show yellowing and brown spots, which are common symptoms of fungal diseases in Kashmir\'s humid climate. Treatment: Apply fungicide within 3-5 days. Remove infected leaves. Improve air circulation around plants.',
      mandiHint: 'Sopore mandi - apple ~Rs.45/kg (demo data)',
      demo: true,
      error: error instanceof Error ? error.message : 'Vision analysis failed',
    })
  }
}
