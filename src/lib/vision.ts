/**
 * Crop / disease vision — wire Roboflow or custom model in production.
 */
export type CropAnalysis = {
  summary: string
  mandiHint: string
}

export async function analyzeCropImage(_photo: File): Promise<CropAnalysis> {
  await new Promise((r) => setTimeout(r, 1100))
  return {
    summary: 'early_fungal_spots',
    mandiHint: 'Sopore mandi — apple ~₹42/kg (demo)',
  }
}
