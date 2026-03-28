/**
 * Document OCR using AI vision capabilities.
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
      throw new Error('OCR request failed')
    }
    
    const data = (await res.json()) as { text?: string; demo?: boolean }
    return data.text ?? ''
  } catch (error) {
    console.error('OCR error:', error)
    // Fallback demo response
    return `[Demo OCR] Government notice: Land records must be submitted by the 15th of this month. Failure to comply may affect your claim. Contact the tehsil office for assistance.`
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
      throw new Error('OCR request failed')
    }
    
    const data = (await res.json()) as { text?: string; demo?: boolean }
    return data.text ?? ''
  } catch (error) {
    console.error('Marksheet OCR error:', error)
    // Fallback demo response
    return `[Demo OCR marksheet] Class 12, Science stream. Subjects: English 82, Urdu 78, Physics 76, Chemistry 80, Biology 77. Aggregate ~78%. Board: JKBOSE. Year: 2024.`
  }
}
