import { NextResponse } from 'next/server'
import { generateOpenRouterText, isOpenRouterAvailable } from '@/lib/openrouter'
import { GoogleGenerativeAI } from '@google/generative-ai'
import {
  demoZameen,
  fallbackRaahAnswer,
} from '@/lib/demoLocalized'
import { parseUiLocale, type UiLocale } from '@/lib/localeForLlm'
import { taleemDemoFallback, taleemPrompts } from '@/lib/taleem-server'
import {
  completeLifecycleRequest,
  createLifecycleRequest,
  failLifecycleRequest,
} from '@/lib/server/convexLifecycle'

function getLanguageInstruction(locale: UiLocale): string {
  if (locale === 'ur') return 'Respond ENTIRELY in Urdu (اردو) script only.'
  if (locale === 'hi') return 'Respond ENTIRELY in Hindi (हिंदी) Devanagari script only.'
  if (locale === 'ks') return 'Respond ENTIRELY in Kashmiri (کٲشُر) script only.'
  return 'Respond in English.'
}

async function geminiChat(system: string, user: string, locale: UiLocale): Promise<string | null> {
  const key = process.env.GEMINI_API_KEY
  if (!key) return null
  try {
    const genAI = new GoogleGenerativeAI(key)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    const langInstruction = getLanguageInstruction(locale)
    const result = await model.generateContent(`${langInstruction}\n\n${system}\n\nUser: ${user}`)
    return result.response.text().trim() || null
  } catch (e) {
    console.error('Gemini chat error:', e)
    return null
  }
}

function generateSimpleFallback(ocrText: string, locale: UiLocale): string {
  // Simple rule-based explanation based on extracted text
  const lowerText = ocrText.toLowerCase()
  
  // Detect document type
  let explanation = ''
  
  if (lowerText.includes('certificate') || lowerText.includes('completion') || lowerText.includes('successfully')) {
    explanation = locale === 'ur' 
      ? 'یہ ایک سرٹیفکیٹ ہے جو کسی کورس یا پروگرام کی تکمیل کی تصدیق کرتا ہے۔'
      : 'This is a certificate confirming successful completion of a course or program.'
  } else if (lowerText.includes('assignment') || lowerText.includes('course') || lowerText.includes('student')) {
    explanation = locale === 'ur' 
      ? 'یہ ایک تعلیمی دستاویز ہے جس میں کورس کی تفصیلات اور طالب علم کی معلومات شامل ہیں۔'
      : 'This is an educational document containing course details and student information.'
  } else if (lowerText.includes('notice') || lowerText.includes('land') || lowerText.includes('records')) {
    explanation = locale === 'ur'
      ? 'یہ ایک سرکاری نوٹس ہے۔ براہ کرم تاریخیں اور ضروریات کو احتیاط سے پڑھیں۔'
      : 'This is an official notice. Please read the dates and requirements carefully.'
  } else {
    explanation = locale === 'ur'
      ? 'یہ دستاویز اہم معلومات پر مشتمل ہے۔'
      : 'This document contains important information.'
  }
  
  // Add key details from extracted text
  const lines = ocrText.split('\n').filter(line => line.trim().length > 3)
  if (lines.length > 0) {
    explanation += '\n\n' + (locale === 'ur' ? 'اہم تفصیلات:\n' : 'Key details from the document:\n')
    explanation += lines.slice(0, 5).map(line => `• ${line.trim()}`).join('\n')
  }
  
  return explanation
}

async function aiChat(
  system: string,
  user: string,
  locale: UiLocale = 'en',
): Promise<string | null> {
  // Try OpenRouter first
  if (isOpenRouterAvailable()) {
    try {
      const text = await generateOpenRouterText(system, user, locale)
      if (text) return text
    } catch (error) {
      console.error('OpenRouter failed, trying Gemini:', error)
    }
  }

  // Fallback to Gemini
  const geminiText = await geminiChat(system, user, locale)
  if (geminiText) return geminiText

  console.error('All AI providers failed')
  return null
}

export async function POST(req: Request) {
  let requestId: string | null = null
  try {
    const body = (await req.json()) as {
      mode?: string
      ocrText?: string
      visionSummary?: string
      mandiHint?: string
      question?: string
      pillar?: string
      sub?: string
      message?: string
      locale?: string
      systemPrompt?: string
    }
    const locale = parseUiLocale(body.locale)
    
    console.log(`🌐 LLM Request - Mode: ${body.mode}, Locale: ${locale}`)

    if (body.mode === 'samjho' && typeof body.ocrText === 'string') {
      requestId = await createLifecycleRequest({
        mode: 'samjho',
        locale,
        input: body.ocrText,
      })
      
      const system = `You are Samjho, powered by HAQQ. Explain government or legal documents in simple language for people with low literacy. Short paragraphs, warm and clear. Include deadlines and next steps.`
      
      const userMessage = `Document text:\n${body.ocrText}\n\nExplain what this means and what the reader should do.`
      
      const aiText = await aiChat(system, userMessage, locale)
      
      // Use simple fallback based on actual OCR text instead of hardcoded demo
      const text = aiText ?? generateSimpleFallback(body.ocrText, locale)
      
      if (requestId) {
        await completeLifecycleRequest(
          requestId,
          text,
          aiText ? 'vercel-ai' : 'fallback',
        )
      }
      return NextResponse.json({
        ok: true,
        text,
        demo: !aiText,
        usedModel: Boolean(aiText),
        requestId,
      })
    }

    if (body.mode === 'zameen' && typeof body.visionSummary === 'string') {
      requestId = await createLifecycleRequest({
        mode: 'zameen',
        locale,
        input: body.visionSummary,
      })
      
      // Check if it's not crop-related
      if (body.visionSummary === 'not_crop_related') {
        const text = locale === 'ur'
          ? 'یہ فصل سے متعلق تصویر نہیں ہے۔ میں صرف فصلوں، پودوں اور کھیتی سے متعلق سوالات میں مدد کر سکتا ہوں۔ براہ کرم اپنی فصل یا پودے کی تصویر اپ لوڈ کریں۔'
          : 'This is not a crop-related image. I can only help with crops, plants, and farming questions. Please upload a photo of your crops or plants.'
        
        if (requestId) {
          await completeLifecycleRequest(requestId, text, 'not-crop')
        }
        return NextResponse.json({
          ok: true,
          text,
          demo: false,
          usedModel: false,
          requestId,
        })
      }
      
      // Check if analysis is unavailable
      if (body.visionSummary === 'crop_analysis_unavailable') {
        const text = locale === 'ur'
          ? 'فصل کا تجزیہ فی الوقت دستیاب نہیں ہے۔ براہ کرم یقینی بنائیں کہ آپ نے اپنی فصل یا پودے کی واضح تصویر اپ لوڈ کی ہے۔'
          : 'Crop analysis is currently unavailable. Please ensure you have uploaded a clear photo of your crop or plant leaves.'
        
        if (requestId) {
          await completeLifecycleRequest(requestId, text, 'unavailable')
        }
        return NextResponse.json({
          ok: true,
          text,
          demo: false,
          usedModel: false,
          requestId,
        })
      }
      
      const mandi =
        typeof body.mandiHint === 'string' ? body.mandiHint : ''
      const system = `You are Zameen, powered by WADI. Give practical crop and disease advice. Mention treatment timing and mandi (market) price when data is provided. Keep it voice-friendly.`
      const user = `Vision summary: ${body.visionSummary}\nMarket note: ${mandi}`
      const aiText = await aiChat(system, user, locale)
      const text = aiText ?? demoZameen(locale)
      if (requestId) {
        await completeLifecycleRequest(
          requestId,
          text,
          aiText ? 'vercel-ai' : 'demo',
        )
      }
      return NextResponse.json({
        ok: true,
        text,
        demo: !aiText,
        usedModel: Boolean(aiText),
        requestId,
      })
    }

    if (body.mode === 'raah' && typeof body.question === 'string') {
      requestId = await createLifecycleRequest({
        mode: 'raah',
        locale,
        input: body.question,
      })
      // Use custom system prompt from modules, or enhanced default
      const system = typeof body.systemPrompt === 'string' && body.systemPrompt.length > 20
        ? body.systemPrompt
        : `You are Raah, an empathetic AI life mentor built for people in Kashmir and rural India. You give practical, warm, and thoughtful advice.

RULES:
- Always provide DETAILED, STRUCTURED responses
- Use numbered lists, pros/cons tables, and clear sections
- Give SPECIFIC suggestions, not generic advice
- Include real-world examples relevant to Kashmir/India context
- End with actionable next steps the person can take TODAY
- Be warm and mentor-like, not robotic
- If someone asks about a decision, ALWAYS give:
  1. Pros and cons of each option
  2. Your honest recommendation with reasoning
  3. Creative alternatives they may not have considered
  4. Specific resources, websites, or programs that can help
  5. A realistic timeline for their situation`
      const aiText = await aiChat(system, body.question, locale)
      const text =
        aiText ??
        fallbackRaahAnswer(body.question, locale, system)
      if (requestId) {
        await completeLifecycleRequest(
          requestId,
          text,
          aiText ? 'vercel-ai' : 'demo',
        )
      }
      return NextResponse.json({
        ok: true,
        text,
        demo: !aiText,
        usedModel: Boolean(aiText),
        requestId,
      })
    }

    if (body.mode === 'taleem' && typeof body.pillar === 'string') {
      requestId = await createLifecycleRequest({
        mode: 'taleem',
        locale,
        input: body.message ?? body.ocrText ?? '',
        pillar: body.pillar,
        sub: body.sub,
      })
      const prompts = taleemPrompts({
        pillar: body.pillar,
        sub: body.sub,
        message: body.message,
        ocrText: body.ocrText,
      })
      const fallback = taleemDemoFallback(
        {
          pillar: body.pillar,
          sub: body.sub,
          message: body.message,
          ocrText: body.ocrText,
        },
        locale,
      )
      if (!prompts) {
        if (requestId) {
          await completeLifecycleRequest(requestId, fallback, 'demo')
        }
        return NextResponse.json({
          ok: true,
          text: fallback,
          demo: true,
          usedModel: false,
          requestId,
        })
      }
      const aiText = await aiChat(prompts.system, prompts.user, locale)
      const text = aiText ?? fallback
      if (requestId) {
        await completeLifecycleRequest(
          requestId,
          text,
          aiText ? 'vercel-ai' : 'demo',
        )
      }
      return NextResponse.json({
        ok: true,
        text,
        demo: !aiText,
        usedModel: Boolean(aiText),
        requestId,
      })
    }

    return NextResponse.json(
      { ok: false, error: 'Invalid payload', demo: false },
      { status: 400 },
    )
  } catch (error) {
    if (requestId) {
      await failLifecycleRequest(
        requestId,
        error instanceof Error ? error.message : 'LLM route failed',
      )
    }
    return NextResponse.json(
      { ok: false, error: 'Bad request', demo: true, requestId },
      { status: 400 },
    )
  }
}
