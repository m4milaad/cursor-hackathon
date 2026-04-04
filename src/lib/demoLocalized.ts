import type { UiLocale } from '@/lib/localeForLlm'

function pick(m: Partial<Record<UiLocale, string>>, locale: UiLocale): string {
  return m[locale] ?? m.en ?? 'Content not available'
}

export function demoSamjho(locale: UiLocale): string {
  return pick({
    en: 'This notice means you must submit your land records by the 15th of the month. If you miss the deadline, your claim may be affected. Ask your patwari or tehsil office for help — keep your ID and land papers ready.',
    hi: 'इस नोटिस का मतलब है कि आपको इस महीने की 15 तारीख तक ज़मीन के कागज़ात जमा कराने हैं। पटवारी या तहसील दफ़्तर से मदद लें।',
    ks: 'یٕہ نوٹسٕچ مَطلب چھُ تُہۍ زَمینٕچ دستاویٖز 15 تٲریٖخَس تام جمع کَرٲوٕنٕ۔',
  }, locale)
}

export function demoZameen(locale: UiLocale): string {
  return pick({
    en: 'Your crop image has been received. Based on common Kashmir crop conditions: inspect leaves for brown/yellow spots (fungal disease), check for white powder (powdery mildew), and look for wilting signs. Apply copper-based fungicide as a precaution. Ensure good drainage.',
    hi: 'आपकी फसल की तस्वीर मिल गई। पत्तों पर भूरे/पीले धब्बे (फंगल रोग) देखें। कॉपर-आधारित फफूंदनाशक लगाएँ।',
    ks: 'تُہٕنٛد فَسَلٕچ تَصویرٕ مِلٕ۔ پَتٮ۪نٛد پٮ۪ٹٛ نِشٲنٛ وٲچھٲوٕ۔ کاپَرٕ سٕپرٮ۪ لَگٲوٕ۔',
  }, locale)
}

export function demoPmKisan(locale: UiLocale): string {
  return pick({
    en: 'PM-KISAN pays registered farmers ₹6,000 per year in three instalments of ₹2,000. Check your name on the beneficiary list. You can check status on pmkisan.gov.in or ask at your nearest CSC.',
    hi: 'पीएम किसान में पंजीकृत किसानों को साल में ₹6000 तीन किस्तों में मिलता है। pmkisan.gov.in पर स्टेटस देखें।',
    ks: 'PM Kisan مَنٛز ₹6000 سٲلٕس تٕرٮ۪ قِسطَنٛ مَنٛز۔ pmkisan.gov.in۔',
  }, locale)
}

export function demoRaahApple(locale: UiLocale): string {
  return pick({
    en: 'This season, watch spray timing and moisture on your apple crop. Use Zameen mode and send a leaf photo to check for disease.',
    hi: 'इस मौसम में सेब की फसल पर स्प्रे और नमी पर ध्यान दें। ज़मीन मोड में पत्ती की तस्वीर भेजें।',
    ks: 'اَم مَوسَمَس مَنٛز سٮ۪بٕچ فَسَلَس پٮ۪ٹٛ نَظَر رَکھٲوٕ۔',
  }, locale)
}

export function demoRaahDocument(locale: UiLocale): string {
  return pick({
    en: 'Open Samjho mode and photograph your document — we will explain it in simple language.',
    hi: 'समझो मोड खोलें और अपने दस्तावेज़ की फोटो लें।',
    ks: 'سَمٮ۪جٮ۪ موٛڈ کھٲلٲوٕ تٮ۪ پَنٕنٛ دَستٲوٮ۪زٕچ تَصویرٕ۔',
  }, locale)
}

export function demoRaahGeneric(locale: UiLocale): string {
  return pick({
    en: 'I am RAASTA. Use Samjho for documents, Zameen for crops, Taleem for jobs and learning, or ask me anything by voice in Raah.',
    hi: 'मैं रास्ता हूँ। कागज़ के लिए समझो, फसल के लिए ज़मीन, नौकरी के लिए तालीम।',
    ks: 'بٲچھٕ رٲستٲ۔ کٲغَزَس باپَتٕ سَمٮ۪جٮ۪، فَسَلٕ باپَتٕ زَمینٕ، نوکری باپَتٕ تٲلیٖم۔',
  }, locale)
}

export function fallbackRaahAnswer(question: string, locale: UiLocale): string {
  const q = question.toLowerCase()
  if (q.includes('pm kisan') || q.includes('kisan') || q.includes('yojana')) return demoPmKisan(locale)
  if (q.includes('seb') || q.includes('apple') || q.includes('fasal')) return demoRaahApple(locale)
  if (q.includes('kagaz') || q.includes('notice') || q.includes('document')) return demoRaahDocument(locale)
  return demoRaahGeneric(locale)
}
