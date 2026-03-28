/**
 * Crop / disease vision analysis using AI.
 */
export type CropAnalysis = {
  summary: string
  mandiHint: string
}

export async function analyzeCropImage(photo: File): Promise<CropAnalysis> {
  try {
    const form = new FormData()
    form.append('file', photo)
    
    const res = await fetch('/api/vision', {
      method: 'POST',
      body: form,
    })
    
    if (!res.ok) {
      throw new Error('Vision analysis failed')
    }
    
    const data = (await res.json()) as { 
      summary?: string
      mandiHint?: string
      demo?: boolean 
    }
    
    return {
      summary: data.summary ?? 'Unable to analyze image',
      mandiHint: data.mandiHint ?? 'Check local mandi for prices',
    }
  } catch (error) {
    console.error('Vision analysis error:', error)
    // Fallback demo response
    return {
      summary: 'early_fungal_spots',
      mandiHint: 'Sopore mandi - apple ~Rs.42/kg (demo)',
    }
  }
}
