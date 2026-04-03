import { NextResponse } from 'next/server'
import { openai } from '@ai-sdk/openai'
import { generateText } from 'ai'
import {
  demoZameen,
  fallbackRaahAnswer,
} from '@/lib/demoLocalized'
import { localeInstruction, parseUiLocale, type UiLocale } from '@/lib/localeForLlm'
import { taleemDemoFallback, taleemPrompts } from '@/lib/taleem-server'
import {
  completeLifecycleRequest,
  createLifecycleRequest,
  failLifecycleRequest,
} from '@/lib/server/convexLifecycle'

const MODEL = openai('gpt-4o-mini')

function withLocale(system: string, locale: UiLocale): string {
  return `${system.trim()}\n\n${localeInstruction(locale)}`
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
  try {
    // Add language enforcement at the beginning of the system prompt
    const languageEnforcement = getLanguageEnforcement(locale)
    const enhancedSystem = `${languageEnforcement}\n\n${system}`
    
    const result = await generateText({
      model: MODEL,
      system: enhancedSystem,
      prompt: user,
      temperature: 0.4,
    })
    return result.text?.trim() ?? null
  } catch (error) {
    console.error('AI Gateway chat error', error)
    return null
  }
}

function getLanguageEnforcement(locale: UiLocale): string {
  if (locale === 'en') {
    return 'RESPOND IN ENGLISH ONLY.'
  }
  
  if (locale === 'ur') {
    return `🚨 ABSOLUTE REQUIREMENT 🚨

YOU ARE FORBIDDEN FROM USING ENGLISH OR LATIN SCRIPT.

YOUR ENTIRE RESPONSE MUST BE IN URDU (اردو) USING ARABIC SCRIPT ONLY.

EXAMPLE OF CORRECT FORMAT:
"یہ ایک سرکاری دستاویز ہے۔ اس میں اہم معلومات شامل ہیں۔ براہ کرم تاریخیں احتیاط سے پڑھیں۔"

BEGIN YOUR URDU RESPONSE BELOW (NO ENGLISH ALLOWED):
---`
  }
  
  if (locale === 'hi') {
    return `🚨 ABSOLUTE REQUIREMENT 🚨

YOU ARE FORBIDDEN FROM USING ENGLISH OR LATIN SCRIPT.

YOUR ENTIRE RESPONSE MUST BE IN HINDI (हिंदी) USING DEVANAGARI SCRIPT ONLY.

EXAMPLE OF CORRECT FORMAT:
"यह एक सरकारी दस्तावेज़ है। इसमें महत्वपूर्ण जानकारी है। कृपया तारीखों को ध्यान से पढ़ें।"

BEGIN YOUR HINDI RESPONSE BELOW (NO ENGLISH ALLOWED):
---`
  }
  
  if (locale === 'ks') {
    return `🚨 ABSOLUTE REQUIREMENT 🚨

YOU ARE FORBIDDEN FROM USING ENGLISH OR LATIN SCRIPT.

YOUR ENTIRE RESPONSE MUST BE IN KASHMIRI (کٲشُر) USING ARABIC SCRIPT ONLY.

BEGIN YOUR KASHMIRI RESPONSE BELOW (NO ENGLISH ALLOWED):
---`
  }
  
  const info = LOCALE_LABELS[locale] ?? LOCALE_LABELS.en
  return `🚨 ABSOLUTE REQUIREMENT 🚨

YOU ARE FORBIDDEN FROM USING ENGLISH OR LATIN SCRIPT.

YOUR ENTIRE RESPONSE MUST BE IN ${info.name.toUpperCase()} USING ${info.script.toUpperCase()} SCRIPT ONLY.

BEGIN YOUR ${info.name.toUpperCase()} RESPONSE BELOW (NO ENGLISH ALLOWED):
---`
}

const LOCALE_LABELS: Record<UiLocale, { name: string; script: string }> = {
  en: { name: 'English', script: 'Latin' },
  hi: { name: 'Hindi', script: 'Devanagari' },
  ur: { name: 'Urdu', script: 'Arabic (Perso-Arabic)' },
  bn: { name: 'Bengali', script: 'Bengali' },
  ta: { name: 'Tamil', script: 'Tamil' },
  te: { name: 'Telugu', script: 'Telugu' },
  mr: { name: 'Marathi', script: 'Devanagari' },
  gu: { name: 'Gujarati', script: 'Gujarati' },
  kn: { name: 'Kannada', script: 'Kannada' },
  ml: { name: 'Malayalam', script: 'Malayalam' },
  pa: { name: 'Punjabi', script: 'Gurmukhi' },
  or: { name: 'Odia', script: 'Odia' },
  as: { name: 'Assamese', script: 'Assamese' },
  sd: { name: 'Sindhi', script: 'Arabic (Perso-Arabic)' },
  ks: { name: 'Kashmiri', script: 'Arabic (Perso-Arabic)' },
  ne: { name: 'Nepali', script: 'Devanagari' },
  kok: { name: 'Konkani', script: 'Devanagari' },
  mai: { name: 'Maithili', script: 'Devanagari' },
  doi: { name: 'Dogri', script: 'Devanagari' },
  sat: { name: 'Santali', script: 'Ol Chiki' },
  mni: { name: 'Manipuri (Meitei)', script: 'Meitei Mayek' },
  brx: { name: 'Bodo', script: 'Devanagari' },
  sa: { name: 'Sanskrit', script: 'Devanagari' },
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
    }
    const locale = parseUiLocale(body.locale)
    
    console.log(`🌐 LLM Request - Mode: ${body.mode}, Locale: ${locale}`)

    if (body.mode === 'samjho' && typeof body.ocrText === 'string') {
      requestId = await createLifecycleRequest({
        mode: 'samjho',
        locale,
        input: body.ocrText,
      })
      
      const system = withLocale(
        `You are Samjho, powered by HAQQ. Explain government or legal documents in simple language for people with low literacy. Short paragraphs, warm and clear. Include deadlines and next steps.`,
        locale,
      )
      
      // Add language instruction to the user message too
      let userMessage = `Document text:\n${body.ocrText}\n\nExplain what this means and what the reader should do.`
      
      if (locale === 'ur') {
        userMessage += `\n\n[IMPORTANT: Respond ONLY in Urdu (اردو) script. Example: "یہ ایک دستاویز ہے۔"]`
      } else if (locale === 'hi') {
        userMessage += `\n\n[IMPORTANT: Respond ONLY in Hindi (हिंदी) Devanagari script. Example: "यह एक दस्तावेज़ है।"]`
      } else if (locale === 'ks') {
        userMessage += `\n\n[IMPORTANT: Respond ONLY in Kashmiri (کٲشُر) script.]`
      }
      
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
      const system = withLocale(
        `You are Zameen, powered by WADI. Give practical crop and disease advice. Mention treatment timing and mandi (market) price when data is provided. Keep it voice-friendly.`,
        locale,
      )
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
      const system = withLocale(
        `You are Raah, the voice layer of RAASTA. Help people in Kashmir and rural India with government schemes, farming, documents, jobs, and education (Taleem). Be concise. No long bullet lists unless asked.`,
        locale,
      )
      const aiText = await aiChat(system, body.question, locale)
      const text =
        aiText ??
        fallbackRaahAnswer(body.question, locale)
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
      const system = withLocale(prompts.system, locale)
      const aiText = await aiChat(system, prompts.user, locale)
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
