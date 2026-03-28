/**
 * Document OCR — wire Tesseract / Google Vision in production.
 * Demo: returns placeholder text so Samjho pipeline runs offline.
 */
export async function extractTextFromImage(_image: File): Promise<string> {
  await new Promise((r) => setTimeout(r, 900))
  return `[Demo OCR] Government notice: Land records must be submitted by the 15th of this month. Failure to comply may affect your claim. Contact the tehsil office for assistance.`
}

/** Marksheet / marks card — swap for real OCR in production. */
export async function extractMarksheetText(_image: File): Promise<string> {
  await new Promise((r) => setTimeout(r, 850))
  return `[Demo OCR marksheet] Class 12, Science stream. Subjects: English 82, Urdu 78, Physics 76, Chemistry 80, Biology 77. Aggregate ~78%. Board: JKBOSE. Year: 2024.`
}
