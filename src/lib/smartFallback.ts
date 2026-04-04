/**
 * Smart input-aware fallback responses for RAASTA Taleem.
 * Reads the user's actual input and generates contextual guidance
 * without requiring any AI API key.
 */
import type { UiLocale } from '@/lib/localeForLlm'

function extractWords(text: string): string[] {
  return text.toLowerCase().replace(/[^\w\s]/g, ' ').split(/\s+/).filter(w => w.length > 2)
}

function detectIndustry(words: string[]): string {
  const map: Record<string, string[]> = {
    'food & beverage': ['food','juice','restaurant','cafe','bakery','chai','snack','catering','cook','kitchen','fruit','apple','saffron','walnut','pickle','jam'],
    'handicrafts & textiles': ['craft','crochet','knit','weave','embroidery','pashmina','shawl','carpet','rug','wood','carving','pottery','jewellery','jewelry','handmade','stitch','sew'],
    'technology & digital': ['app','website','software','tech','digital','online','ecommerce','social','youtube','content','blog','coding','programming','computer','mobile','graphic','design','video','editing','photo','animation','ui','ux'],
    'agriculture & farming': ['farm','crop','agriculture','organic','greenhouse','nursery','flower','herb','mushroom','dairy','poultry','fish','honey','bee'],
    'education & training': ['tuition','coaching','teaching','school','training','course','skill','learn','education','academy'],
    'tourism & hospitality': ['tourism','hotel','homestay','travel','guide','trek','adventure','resort','houseboat','tour'],
    'retail & trading': ['shop','store','retail','trade','sell','buy','market','wholesale','import','export'],
    'services': ['repair','service','maintenance','cleaning','laundry','salon','beauty','health','clinic','pharmacy','transport','delivery'],
  }
  for (const [industry, keywords] of Object.entries(map)) {
    if (keywords.some(k => words.some(w => w.includes(k) || k.includes(w)))) return industry
  }
  return 'general business'
}

export function smartIdeaFeedback(message: string, locale: UiLocale): string {
  const words = extractWords(message)
  const industry = detectIndustry(words)
  const isOnline = words.some(w => ['online','fiverr','upwork','remote','digital','internet','ecommerce'].includes(w))

  if (locale === 'ur' || locale === 'ks') {
    return `آپ کا خیال: "${message.slice(0, 60)}"\n\nصنعت: ${industry}\n\nطاقتیں:\n- کشمیری مصنوعات کی عالمی پہچان\n- آن لائن مارکیٹ بڑھ رہی ہے\n- مقامی مانگ موجود ہے\n\nخطرات: سرمایہ، مارکیٹنگ، معیار\n\nپہلے قدم:\n1. چھوٹا شروع کریں - 5-10 یونٹ بنائیں\n2. Instagram اور WhatsApp Business پر مفت رجسٹر کریں\n3. ضلع DIC دفتر جائیں - Udyam رجسٹریشن مفت ہے\n4. PM Mudra قرض (10 لاکھ تک) اور jkedi.org دیکھیں\n\nنوٹ: مفت Gemini API key کے لیے aistudio.google.com جائیں۔`
  }

  return `Your idea: "${message.slice(0, 80)}"\n\nINDUSTRY: ${industry}\nMARKET: ${isOnline ? 'Online + local demand possible' : 'Local market focus'}\n\nSTRENGTHS\n- Kashmir has strong brand value for handmade and natural products globally\n- Growing demand for authentic Kashmiri products online (Etsy, Amazon, Instagram)\n- Low organized competition in ${industry} locally\n\nRISKS\n- Initial capital and raw material sourcing\n- Marketing and reaching customers outside Kashmir\n- Quality consistency at scale\n\nFIRST STEPS\n1. Start small - make 5-10 units and test with friends/family\n2. Register free on Instagram and WhatsApp Business\n3. Visit district DIC office for free Udyam registration and scheme guidance\n4. Check PM Mudra loan (up to Rs.10 lakh) and J&K startup schemes at jkedi.org\n\nNote: Add a free Gemini API key (aistudio.google.com) for personalized AI analysis.`
}

export function smartSchemesFeedback(message: string, locale: UiLocale): string {
  const words = extractWords(message)
  const industry = detectIndustry(words)

  if (locale === 'ur' || locale === 'ks') {
    return `"${industry}" کے لیے اسکیمیں:\n\n- PM Mudra - 10 لاکھ تک قرض۔ mudra.org.in\n- Mission YUVA (J&K) - نوجوان کاروباری مدد۔ jkedi.org\n- PMEGP - 35% سبسڈی۔ kvic.gov.in\n- Udyam رجسٹریشن - مفت MSME رجسٹریشن۔ udyamregistration.gov.in\n\nاگلا قدم: ضلع DIC دفتر جائیں - آدھار اور خیال لے کر۔`
  }

  return `Schemes for "${industry}" in J&K:\n\nGOVERNMENT SCHEMES\n- PM Mudra Yojana: loans up to Rs.10 lakh. Apply at any bank or mudra.org.in\n- Mission YUVA (J&K): youth entrepreneurship support. jkedi.org\n- J&K Startup Policy: grants for tech/innovation startups. jkedi.org\n- PMEGP: manufacturing/service units, subsidy up to 35%. kvic.gov.in\n- Udyam Registration: free MSME registration. udyamregistration.gov.in\n\nNEXT STEP: Visit your district DIC (District Industries Centre) with your Aadhaar and business idea - they guide you through applications for free.\n\nAlways verify eligibility on official portals.`
}

export function smartCheckinResponse(message: string, locale: UiLocale): string {
  const words = extractWords(message)
  const isCrisis = words.some(w => ['suicide','die','kill','harm','marna','khatam'].includes(w))

  if (isCrisis) {
    return locale === 'ur' || locale === 'ks'
      ? 'آپ کی بات سن رہا ہوں۔ ابھی مدد لیں - Vandrevala Foundation: 9999666555 (24/7 مفت)۔ آپ اکیلے نہیں ہیں۔'
      : 'I hear you. Please reach out for help right now - Vandrevala Foundation: 9999666555 (24/7, free). You are not alone.'
  }

  if (locale === 'ur' || locale === 'ks') {
    return `آپ کی بات سمجھ آئی۔ "${message.slice(0, 40)}" - یہ احساس درست ہے، آپ اکیلے نہیں۔\n\nایک آسان مشق:\n- 4 گنتی سانس اندر\n- 4 گنتی روکیں\n- 4 گنتی باہر\n\nاگر بات کرنی ہو: Vandrevala 9999666555 (مفت، 24/7)۔\n\nنوٹ: میں AI ہوں، ڈاکٹر نہیں۔ مستقل مدد کے لیے پیشہ ور سے ملیں۔`
  }

  return `I hear you. What you're feeling about "${message.slice(0, 60)}" is valid and you're not alone.\n\nA quick grounding exercise:\n- Breathe in slowly for 4 counts\n- Hold for 4 counts\n- Breathe out for 4 counts\n- Repeat 3 times\n\nOne small step today: write down one thing you can control right now.\n\nIf you need to talk: Vandrevala Foundation 9999666555 (free, 24/7) or iCall 9152987821.\n\nNote: I'm an AI assistant, not a therapist. For ongoing support, please speak with a professional.`
}

export function smartSkillMap(message: string, locale: UiLocale): string {
  const words = extractWords(message)
  const industry = detectIndustry(words)

  if (locale === 'ur' || locale === 'ks') {
    return `مہارت تجزیہ: "${message.slice(0, 50)}"\n\nآپ کی مہارت: ${industry}\n\nملتی نوکریاں:\n- ${industry} میں ہنرمند کارکن\n- آن لائن فروخت (Meesho، Amazon)\n- اپنا کاروبار\n\nسیکھنے کا راستہ:\n1. YouTube پر "${industry}" ٹیوٹوریل\n2. PMKVY - مفت تربیت۔ pmkvyofficial.org\n3. Google Digital Garage - مفت`
  }

  return `Skills analysis for: "${message.slice(0, 80)}"\n\nYOUR SKILL CATEGORY: ${industry}\n\nMATCHING JOB ROLES\n- Skilled worker/technician in ${industry}\n- Self-employed/freelancer in your domain\n- Online seller (Meesho, Amazon, Etsy for handmade)\n- Assistant at established businesses\n\nSKILL GAPS TO FILL\n- Basic English communication (for online work)\n- Smartphone and WhatsApp Business usage\n- Basic accounting/pricing knowledge\n\nLEARNING ROADMAP (free)\n1. YouTube - search "${industry} tutorial" in Hindi/Urdu\n2. PMKVY - free skill training near you. pmkvyofficial.org\n3. Google Digital Garage - free digital marketing\n4. SWAYAM - free online courses with certificates\n\nNEXT STEP: Visit your nearest PMKVY center for free training.`
}

export function smartGigIdeas(message: string, locale: UiLocale): string {
  const words = extractWords(message)
  const industry = detectIndustry(words)

  if (locale === 'ur' || locale === 'ks') {
    return `آپ کی مہارت "${industry}" کے لیے گِگ خیالات:\n\n1. Fiverr پر $5-10 سے شروع کریں\n2. WhatsApp/Instagram پر مقامی فروخت\n3. اپنی مہارت دوسروں کو سکھائیں\n4. Meesho پر ری سیلنگ - بغیر سرمایہ\n\nاحتیاط: کلائنٹ تصدیق کریں۔ پیشگی پیسے نہ دیں۔`
  }

  return `Gig ideas for "${industry}":\n\nTOP 5 GIG IDEAS\n1. ${industry} services on Fiverr - start at $5-10, build reviews\n2. Local WhatsApp/Instagram business - sell directly to customers\n3. Teaching your skill to others (online or in-person)\n4. Content creation - document your work on YouTube/Instagram Reels\n5. Meesho reselling - no inventory needed, earn commission\n\nPLATFORMS\n- Fiverr.com: international clients, payment in USD\n- Upwork.com: project-based work, higher rates\n- Meesho: Indian reselling, no investment needed\n\nPRICING: Start at Rs.200-500 per task, increase after 5+ reviews.\n\nSAFETY: Always verify clients. Never pay upfront fees.`
}

export function smartFreelanceGuide(message: string, locale: UiLocale): string {
  const words = extractWords(message)
  const isUpwork = words.some(w => w.includes('upwork'))
  const platform = isUpwork ? 'Upwork' : 'Fiverr'
  const url = isUpwork ? 'upwork.com' : 'fiverr.com'

  if (locale === 'ur' || locale === 'ks') {
    return `${platform} پر فری لانسنگ:\n\nشروع کریں:\n1. ${url} پر اکاؤنٹ بنائیں\n2. صاف تصویر اور مختصر بائیو\n3. پہلی گِگ: $5-10 سے شروع\n\nکامیابی کے لیے:\n- 1 گھنٹے میں جواب دیں\n- وقت پر ڈیلیور کریں\n- ریویو مانگیں\n\nادائیگی: PayPal یا Payoneer سے بینک ٹرانسفر۔`
  }

  return `Freelancing guide for ${platform}:\n\nGETTING STARTED\n1. Create account at ${url}\n2. Use a clear, professional profile photo\n3. Write a short bio in English (2-3 sentences about your skill)\n4. Create your first service listing\n\nYOUR FIRST GIG\n- Title: "I will [do X] for [Y]"\n- Price: Start at $5-10 to get first reviews\n- Delivery time: 3-5 days for first orders\n\nTIPS FOR SUCCESS\n- Respond to messages within 1 hour\n- Deliver on time, every time\n- Ask satisfied clients for reviews\n\nPAYMENT: Use PayPal or Payoneer for Indian bank transfers.\n\nSAFETY: Never share personal contact outside the platform.`
}

export function smartNaukriGuide(message: string, locale: UiLocale): string {
  const words = extractWords(message)
  const hasGrad = words.some(w => ['graduate','degree','bsc','btech','msc','graduation'].includes(w))
  const has12th = words.some(w => ['12th','intermediate','class12','higher'].includes(w))
  const level = hasGrad ? 'Graduate' : has12th ? '12th Pass' : 'your qualification'

  if (locale === 'ur' || locale === 'ks') {
    return `${level} کے لیے نوکری رہنمائی:\n\nسرکاری پورٹل:\n- JKSSB: jkssb.nic.in\n- JKPSC: jkpsc.nic.in\n- SSC: ssc.nic.in\n\nتیاری:\n1. JKSSB سلیبس ڈاؤنلوڈ کریں\n2. روزانہ 10 GK سوال\n3. J&K کرنٹ افیئرز پڑھیں`
  }

  return `Job guidance for ${level} in J&K:\n\nGOVERNMENT JOB PORTALS\n- JKSSB: jkssb.nic.in\n- JKPSC: jkpsc.nic.in\n- J&K Police: jkpolice.gov.in\n- SSC: ssc.nic.in\n\nJOBS FOR ${level.toUpperCase()}\n${hasGrad ? '- Class I/II gazetted posts, banking, teaching\n- JKPSC competitive exams\n- Central government jobs (UPSC, SSC CGL)' : '- JKSSB Class IV posts\n- Police constable, forest guard\n- SSC CHSL, MTS\n- Bank clerk exams'}\n\nHOW TO PREPARE\n1. Download JKSSB syllabus from jkssb.nic.in\n2. Practice 10 GK questions daily\n3. Read J&K current affairs (Greater Kashmir, Rising Kashmir)\n4. Use the Exam Prep tab for AI-generated practice questions`
}

export function smartCvGeneration(message: string, _locale: UiLocale): string {
  const nameMatch = message.match(/(?:my name is|i am|i'm)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i)
  const name = nameMatch ? nameMatch[1] : '[Your Name]'
  const lines = message.split(/[.\n]/).map(l => l.trim()).filter(l => l.length > 5)

  return `CURRICULUM VITAE\n\nNAME: ${name}\nLOCATION: Kashmir, India\nEMAIL: [your.email@example.com]\nPHONE: [Your phone number]\n\nPROFILE\n${lines[0] || 'Motivated individual with practical skills and a strong desire to contribute and grow.'}\n\nEXPERIENCE\n${lines[1] ? '- ' + lines[1] : '- [Describe your work experience or informal work]'}\n${lines[2] ? '- ' + lines[2] : '- Available for new opportunities'}\n\nSKILLS\n- Communication in Urdu/Hindi/English\n- Smartphone and basic computer usage\n- Quick learner, team player\n- [Add your specific skills]\n\nEDUCATION\n- [Your highest qualification - school/college name, year]\n\nLANGUAGES\n- Urdu (native), Hindi (fluent), English (basic/intermediate)\n\nREFERENCES\nAvailable on request\n\n---\nDraft generated by RAASTA Taleem. Edit all [bracketed] fields before sending.\nAdd a Gemini API key for a fully personalized AI-generated CV.`
}

export function smartExamFeedback(message: string, locale: UiLocale): string {
  const wordCount = message.split(/\s+/).length
  const hasReasoning = message.includes('because') || message.includes('therefore') || message.includes('since')

  if (locale === 'ur' || locale === 'ks') {
    return `امتحان جواب کا جائزہ:\n\n"${message.slice(0, 60)}..."\n\n${wordCount > 20 ? 'اچھی لمبائی' : 'جواب مختصر ہے - مزید تفصیل دیں'}\n\nبہتری کے لیے:\n1. تعارف - اہم نکات - نتیجہ\n2. مثالیں شامل کریں\n3. روزانہ 10 سوال مشق کریں`
  }

  return `Exam answer feedback:\n\nYOUR ANSWER: "${message.slice(0, 100)}${message.length > 100 ? '...' : ''}"\n\nASSESSMENT\n${wordCount > 20 ? 'Good length - you provided detail' : 'Answer is brief - try to add more explanation'}\n${hasReasoning ? 'Good use of reasoning' : 'Add reasoning - explain WHY, not just WHAT'}\n\nIMPROVEMENT TIPS\n1. Structure: Introduction - Main points - Conclusion\n2. Use keywords from the question in your answer\n3. Add specific examples (dates, names, places for GK)\n4. Practice writing answers in 5-7 sentences\n\nSTUDY TIP: For JKSSB, focus on J&K history, geography, current affairs, and basic GK.`
}

export function taleemSmartFallback(
  pillar: string,
  sub: string,
  message: string,
  ocrText: string,
  locale: UiLocale,
): string {
  const input = message || ocrText || ''

  if (pillar === 'hunarmand' && sub === 'idea') return smartIdeaFeedback(input, locale)
  if (pillar === 'hunarmand' && sub === 'schemes') return smartSchemesFeedback(input, locale)
  if (pillar === 'sukoon' && sub === 'checkin') return smartCheckinResponse(input, locale)
  if (pillar === 'kaam' && sub === 'skill') return smartSkillMap(input, locale)
  if (pillar === 'kaam' && sub === 'gig') return smartGigIdeas(input, locale)
  if (pillar === 'kaam' && sub === 'freelance') return smartFreelanceGuide(input, locale)
  if (pillar === 'naukri') return smartNaukriGuide(input, locale)
  if (pillar === 'cv') return smartCvGeneration(input, locale)
  if (pillar === 'exam') return smartExamFeedback(input, locale)
  if (pillar === 'scholarship') {
    return `Scholarship guidance:\n\nCheck National Scholarship Portal: scholarships.gov.in\nJ&K scholarships: jkscholarship.nic.in\nDeadlines: typically September-November\n\nKeep ready: income certificate, marksheet, Aadhaar, bank account details.\n\nNote: Add a Gemini API key for personalized scholarship matching based on your actual marks.`
  }

  return `I received your message: "${input.slice(0, 80)}". For personalized AI responses, add a free Gemini API key from aistudio.google.com to your .env.local file as GEMINI_API_KEY.`
}
