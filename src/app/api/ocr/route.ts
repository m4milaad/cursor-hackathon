import { NextResponse } from 'next/server'
import { openai } from '@ai-sdk/openai'
import { generateText } from 'ai'

export async function POST(req: Request) {
  console.log('📄 OCR API called')
  
  let form: FormData
  try {
    form = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid form' }, { status: 400 })
  }

  const file = form.get('file')
  const type = form.get('type') as string | null // 'document' or 'marksheet'
  
  console.log('📄 File received:', file instanceof File ? file.name : 'no file')
  console.log('📄 File size:', file instanceof File ? file.size : 0)
  console.log('📄 Type:', type)
  
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json(
      { ok: false, error: 'Missing image file', demo: false },
      { status: 400 },
    )
  }

  // Check if OpenAI API key is available
  const hasOpenAI = !!process.env.OPENAI_API_KEY
  console.log('🔑 OpenAI API Key exists:', hasOpenAI)
  console.log('🔑 API Key preview:', process.env.OPENAI_API_KEY?.substring(0, 20) + '...')

  if (!hasOpenAI) {
    console.log('⚠️ No API key - returning demo data')
    // Return demo fallback immediately
    const demoText = type === 'marksheet'
      ? '[Demo OCR marksheet] Class 12, Science stream. Subjects: English 82, Urdu 78, Physics 76, Chemistry 80, Biology 77. Aggregate ~78%. Board: JKBOSE. Year: 2024.'
      : '[Demo OCR] Government notice: Land records must be submitted by the 15th of this month. Failure to comply may affect your claim. Contact the tehsil office for assistance.'
    
    return NextResponse.json({
      ok: true,
      text: demoText,
      demo: true,
    })
  }

  try {
    console.log('🤖 Starting OpenAI OCR...')
    
    // Convert file to base64
    const bytes = await file.arrayBuffer()
    const base64 = Buffer.from(bytes).toString('base64')
    const mimeType = file.type || 'image/jpeg'
    const dataUrl = `data:${mimeType};base64,${base64}`
    
    console.log('📸 Image converted to base64, length:', base64.length)

    const systemPrompt = type === 'marksheet'
      ? `You are an expert OCR assistant specializing in educational documents. 

Extract ALL text from this marksheet/report card image with high accuracy.

Include:
- Student name
- Class/Grade
- Roll number
- All subjects with marks
- Total marks and percentage
- Board/Institution name
- Year/Session
- Any remarks or grades

Format the output clearly and preserve the structure.`
      : `You are an expert OCR assistant specializing in official documents.

Extract ALL text from this document image with high accuracy.

Preserve:
- Document structure and formatting
- Official notices and announcements
- Dates and deadlines
- Important information and requirements
- Any signatures or stamps (describe them)

Support multiple languages including Urdu, Hindi, Kashmiri, and English.
If text is in Urdu/Hindi/Kashmiri, transliterate it to Roman script.`

    console.log('🤖 Calling OpenAI API...')
    
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
      temperature: 0.1, // Low temperature for accurate OCR
    })

    const extractedText = result.text?.trim() ?? ''
    
    console.log('✅ OCR successful, text length:', extractedText.length)
    console.log('📝 Extracted text preview:', extractedText.substring(0, 100))
    
    if (!extractedText) {
      throw new Error('No text extracted from image')
    }

    return NextResponse.json({
      ok: true,
      text: extractedText,
      demo: false,
    })
  } catch (error) {
    console.error('❌ OCR error:', error)
    console.error('❌ Error details:', error instanceof Error ? error.message : 'Unknown error')
    
    // Return demo fallback on error
    const demoText = type === 'marksheet'
      ? '[Demo OCR marksheet] Class 12, Science stream. Subjects: English 82, Urdu 78, Physics 76, Chemistry 80, Biology 77. Aggregate ~78%. Board: JKBOSE. Year: 2024.'
      : '[Demo OCR] Government notice: Land records must be submitted by the 15th of this month. Failure to comply may affect your claim. Contact the tehsil office for assistance.'
    
    return NextResponse.json({
      ok: true,
      text: demoText,
      demo: true,
      error: error instanceof Error ? error.message : 'OCR failed',
    })
  }
}
