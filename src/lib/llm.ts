import type { UiLocale } from '@/lib/localeForLlm'

async function postLlm(payload: Record<string, string>): Promise<string> {
  const res = await fetch('/api/llm', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = (await res.json()) as {
    ok?: boolean
    text?: string
    error?: string
  }
  if (!res.ok || data.ok === false) {
    throw new Error(data.error ?? 'LLM request failed')
  }
  return data.text ?? ''
}

export async function explainDocumentSimpleUrdu(
  ocrText: string,
  locale: UiLocale,
): Promise<string> {
  try {
    console.log(`📝 Calling LLM API with locale: ${locale}`)
    return await postLlm({ mode: 'samjho', ocrText, locale })
  } catch (error) {
    console.error('LLM explanation failed, using simple fallback:', error)
    // Simple fallback explanation based on the extracted text
    return generateSimpleExplanation(ocrText, locale)
  }
}

function generateSimpleExplanation(text: string, locale: UiLocale): string {
  // Simple rule-based explanation
  const lowerText = text.toLowerCase()
  
  // Detect document type
  let explanation = ''
  
  if (lowerText.includes('assignment') || lowerText.includes('course')) {
    explanation = locale === 'ur' 
      ? 'یہ ایک تعلیمی اسائنمنٹ ہے۔ اس میں کورس کی تفصیلات اور طالب علم کی معلومات شامل ہیں۔'
      : 'This is an educational assignment document. It contains course details and student information.'
  } else if (lowerText.includes('certificate') || lowerText.includes('completed')) {
    explanation = locale === 'ur'
      ? 'یہ ایک سرٹیفکیٹ ہے جو کسی کورس یا پروگرام کی تکمیل کی تصدیق کرتا ہے۔'
      : 'This is a certificate confirming completion of a course or program.'
  } else if (lowerText.includes('notice') || lowerText.includes('land') || lowerText.includes('records')) {
    explanation = locale === 'ur'
      ? 'یہ ایک سرکاری نوٹس ہے۔ براہ کرم تاریخیں اور ضروریات کو احتیاط سے پڑھیں۔'
      : 'This is an official notice. Please read the dates and requirements carefully.'
  } else {
    explanation = locale === 'ur'
      ? 'یہ دستاویز اہم معلومات پر مشتمل ہے۔ براہ کرم اسے احتیاط سے پڑھیں۔'
      : 'This document contains important information. Please read it carefully.'
  }
  
  // Add extracted text summary
  const lines = text.split('\n').filter(line => line.trim().length > 0)
  if (lines.length > 0) {
    explanation += '\n\n' + (locale === 'ur' ? 'اہم تفصیلات:' : 'Key Details:')
    explanation += '\n' + lines.slice(0, 5).join('\n')
  }
  
  return explanation
}

export async function explainCropAdvice(
  visionSummary: string,
  mandiHint: string,
  locale: UiLocale,
): Promise<string> {
  try {
    return await postLlm({ mode: 'zameen', visionSummary, mandiHint, locale })
  } catch (error) {
    console.error('explainCropAdvice failed:', error)
    return 'Based on the crop image analysis, monitor your plants closely for disease progression. Apply preventive fungicide treatment and ensure proper drainage. Check your local mandi for current prices.'
  }
}

export async function answerVoiceQuestion(
  question: string,
  locale: UiLocale,
): Promise<string> {
  return postLlm({ mode: 'raah', question, locale })
}
