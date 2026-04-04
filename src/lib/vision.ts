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
    
    // First, do a quick local check
    const localCheck = await quickImageCheck(photo)
    if (localCheck.isDefinitelyNotCrop) {
      return {
        summary: 'not_crop_related',
        mandiHint: localCheck.reason || 'This does not appear to be a crop image.',
      }
    }
    
    const res = await fetch('/api/vision', {
      method: 'POST',
      body: form,
    })
    
    if (!res.ok) {
      console.log('Vision API failed, using simple fallback')
      return analyzeImageLocally(photo)
    }
    
    const data = (await res.json()) as { 
      ok?: boolean
      summary?: string
      mandiHint?: string
      demo?: boolean
      error?: string
    }
    
    if (data.ok === false) {
      throw new Error(data.error ?? 'Vision analysis failed')
    }

    // Use whatever summary came back — demo or real
    return {
      summary: data.summary ?? 'Unable to analyze image',
      mandiHint: data.mandiHint ?? 'Check local mandi for prices',
    }
  } catch (error) {
    console.error('Vision analysis error:', error)
    return {
      summary: 'Unable to analyze the image at this time. Please try again.',
      mandiHint: 'Check your local mandi for current prices.',
    }
  }
}

async function quickImageCheck(photo: File): Promise<{ isDefinitelyNotCrop: boolean, reason?: string }> {
  const filename = photo.name.toLowerCase()
  
  // Check file type
  if (!photo.type.startsWith('image/')) {
    return { isDefinitelyNotCrop: true, reason: 'Please upload an image file.' }
  }
  
  // Check filename for obvious non-crop indicators
  const nonCropKeywords = [
    'certificate', 'document', 'pdf', 'doc', 'paper', 'text', 
    'screenshot', 'receipt', 'invoice', 'form', 'application',
    'id', 'card', 'passport', 'license', 'marksheet', 'degree'
  ]
  
  const hasNonCropKeyword = nonCropKeywords.some(keyword => filename.includes(keyword))
  if (hasNonCropKeyword) {
    return { 
      isDefinitelyNotCrop: true, 
      reason: 'This appears to be a document, not a crop image. Please upload a photo of your crops, leaves, or plants.' 
    }
  }
  
  // Check if it's likely a crop image
  const cropKeywords = ['crop', 'plant', 'leaf', 'leaves', 'apple', 'wheat', 'rice', 'saffron', 'farm', 'field', 'tree', 'flower', 'fruit', 'vegetable']
  const hasCropKeyword = cropKeywords.some(keyword => filename.includes(keyword))
  
  if (hasCropKeyword) {
    return { isDefinitelyNotCrop: false }
  }
  
  // If filename is generic (IMG_xxxx, photo, etc), allow it
  if (/^(img|photo|image|pic|dsc|dcim)[\d_-]/i.test(filename)) {
    return { isDefinitelyNotCrop: false }
  }
  
  // Default: allow but will be checked by AI
  return { isDefinitelyNotCrop: false }
}

async function analyzeImageLocally(photo: File): Promise<CropAnalysis> {
  // Simple check based on filename and basic analysis
  const filename = photo.name.toLowerCase()
  
  // Check if filename suggests it's a crop/plant image
  const cropKeywords = ['crop', 'plant', 'leaf', 'apple', 'wheat', 'rice', 'saffron', 'farm', 'field']
  const isCropRelated = cropKeywords.some(keyword => filename.includes(keyword))
  
  // Check if it's clearly not a crop (certificate, document, etc.)
  const nonCropKeywords = ['certificate', 'document', 'assignment', 'pdf', 'doc', 'paper', 'text']
  const isNonCrop = nonCropKeywords.some(keyword => filename.includes(keyword))
  
  if (isNonCrop || (!isCropRelated && (filename.includes('.pdf') || filename.includes('doc')))) {
    return {
      summary: 'not_crop_related',
      mandiHint: 'This does not appear to be a crop image. Please upload a photo of your crops, leaves, or plants for analysis.',
    }
  }
  
  // Default: assume it might be a crop but we can't analyze without AI
  return {
    summary: 'crop_analysis_unavailable',
    mandiHint: 'AI crop analysis is currently unavailable. Please ensure you have uploaded a clear photo of your crop or plant leaves. For best results, add OpenAI API credits.',
  }
}
