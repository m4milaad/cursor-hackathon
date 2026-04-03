/**
 * Document OCR using AI vision capabilities with Tesseract.js fallback.
 */
export async function extractTextFromImage(image: File): Promise<string> {
  try {
    const form = new FormData()
    form.append('file', image)
    form.append('type', 'document')
    
    const res = await fetch('/api/ocr', {
      method: 'POST',
      body: form,
    })
    
    if (!res.ok) {
      console.log('OCR API failed, trying Tesseract.js fallback...')
      return await extractTextWithTesseract(image)
    }
    
    const data = (await res.json()) as {
      ok?: boolean
      text?: string
      demo?: boolean
      error?: string
    }
    
    // If API returns empty or demo mode, use Tesseract
    if (!data.text || data.demo || data.text.includes('[Demo OCR]')) {
      console.log('OCR returned demo/empty, using Tesseract.js fallback...')
      return await extractTextWithTesseract(image)
    }
    
    if (data.ok === false) {
      throw new Error(data.error ?? 'OCR request failed')
    }
    return data.text ?? ''
  } catch (error) {
    console.error('OCR error, trying Tesseract.js fallback:', error)
    try {
      return await extractTextWithTesseract(image)
    } catch (tesseractError) {
      console.error('Tesseract.js also failed:', tesseractError)
      return `[Error] Could not extract text from image. Please try again with a clearer image.`
    }
  }
}

/** Client-side OCR using Tesseract.js */
async function extractTextWithTesseract(image: File): Promise<string> {
  try {
    // Dynamic import to avoid SSR issues
    const Tesseract = await import('tesseract.js')
    
    console.log('🔍 Starting Tesseract.js OCR...')
    
    const result = await Tesseract.recognize(
      image,
      'eng', // English - you can add more languages like 'eng+hin+urd'
      {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            console.log(`Tesseract progress: ${Math.round(m.progress * 100)}%`)
          }
        }
      }
    )
    
    const text = result.data.text.trim()
    console.log('✅ Tesseract.js extracted text:', text.substring(0, 100))
    
    if (!text) {
      throw new Error('No text extracted')
    }
    
    return text
  } catch (error) {
    console.error('Tesseract.js error:', error)
    throw error
  }
}

/** Marksheet / marks card OCR */
export async function extractMarksheetText(image: File): Promise<string> {
  try {
    const form = new FormData()
    form.append('file', image)
    form.append('type', 'marksheet')
    
    const res = await fetch('/api/ocr', {
      method: 'POST',
      body: form,
    })
    
    if (!res.ok) {
      console.log('Marksheet OCR API failed, trying Tesseract.js fallback...')
      return await extractTextWithTesseract(image)
    }
    
    const data = (await res.json()) as {
      ok?: boolean
      text?: string
      demo?: boolean
      error?: string
    }
    
    // If API returns empty or demo mode, use Tesseract
    if (!data.text || data.demo || data.text.includes('[Demo OCR]')) {
      console.log('Marksheet OCR returned demo/empty, using Tesseract.js fallback...')
      return await extractTextWithTesseract(image)
    }
    
    if (data.ok === false) {
      throw new Error(data.error ?? 'OCR request failed')
    }
    return data.text ?? ''
  } catch (error) {
    console.error('Marksheet OCR error, trying Tesseract.js fallback:', error)
    try {
      return await extractTextWithTesseract(image)
    } catch (tesseractError) {
      console.error('Tesseract.js also failed:', tesseractError)
      return `[Error] Could not extract text from marksheet. Please try again with a clearer image.`
    }
  }
}
