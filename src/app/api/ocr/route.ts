import { NextResponse } from 'next/server'
import { generateText } from 'ai'
import {
  completeLifecycleRequest,
  createLifecycleRequest,
  failLifecycleRequest,
} from '@/lib/server/convexLifecycle'

const MODEL = 'openai/gpt-4o-mini'

export async function POST(req: Request) {
  let requestId: string | null = null
  let form: FormData
  try {
    form = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid form' }, { status: 400 })
  }

  const file = form.get('file')
  const type = form.get('type') as string | null // 'document' or 'marksheet'
  
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json(
      { ok: false, error: 'Missing image file', demo: false },
      { status: 400 },
    )
  }

  try {
    requestId = await createLifecycleRequest({
      mode: type === 'marksheet' ? 'ocr-marksheet' : 'ocr-document',
      locale: 'en',
      input: file.name,
    })

    // Convert file to base64
    const bytes = await file.arrayBuffer()
    const base64 = Buffer.from(bytes).toString('base64')
    const mimeType = file.type || 'image/jpeg'
    const dataUrl = `data:${mimeType};base64,${base64}`

    const systemPrompt = type === 'marksheet'
      ? 'You are an OCR assistant. Extract all text from this marksheet/report card image. Include: student name, class/grade, subjects with marks, percentage, board/institution name, year. Format clearly.'
      : 'You are an OCR assistant. Extract all text from this document image exactly as it appears. Preserve the structure and formatting. Include any official notices, dates, deadlines, and important information.'

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
      maxOutputTokens: 2000,
    })

    const text = result.text?.trim() ?? ''
    if (requestId) {
      await completeLifecycleRequest(requestId, text, 'vercel-ai')
    }
    return NextResponse.json({
      ok: true,
      text: result.text?.trim() ?? '',
      demo: false,
      requestId,
    })
  } catch (error) {
    console.error('OCR error', error)
    if (requestId) {
      await failLifecycleRequest(
        requestId,
        error instanceof Error ? error.message : 'OCR request failed',
      )
    }
    
    // Return demo fallback
    const demoText = type === 'marksheet'
      ? '[Demo OCR marksheet] Class 12, Science stream. Subjects: English 82, Urdu 78, Physics 76, Chemistry 80, Biology 77. Aggregate ~78%. Board: JKBOSE. Year: 2024.'
      : '[Demo OCR] Government notice: Land records must be submitted by the 15th of this month. Failure to comply may affect your claim. Contact the tehsil office for assistance.'
    
    return NextResponse.json({
      ok: true,
      text: demoText,
      demo: true,
      requestId,
    })
  }
}
