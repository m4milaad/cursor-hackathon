import type { UiLocale } from '@/lib/localeForLlm'

function pick(m: Record<UiLocale, string>, locale: UiLocale): string {
  return m[locale] ?? m.en
}

export function demoSamjho(locale: UiLocale): string {
  return pick(
    {
      en: 'This notice means you must submit your land records by the 15th of the month. If you miss the deadline, your claim may be affected. Ask your patwari or tehsil office for help — keep your ID and land papers ready.',
      hi: 'इस नोटिस का मतलब है कि आपको इस महीने की 15 तारीख तक ज़मीन के कागज़ात जमा कराने हैं। समय पर जमा न करने पर आपका दावा प्रभावित हो सकता है। पटवारी या तहसील दफ़्तर से मदद लें — अपना पहचान पत्र और ज़मीन के कागज़ साथ रखें।',
      ks: 'یٕہ نوٹسٕچ مَطلب چھُ تُہۍ زَمینٕچ دستاویٖز 15 تٲریٖخَس تام جمع کَرٲوٕنٕ۔ مُدٲت پٮ۪ٹٕنٲے سٕتۍ تُہُنٛد دَعوی مُمکِنٕ چھُ اَسَر مَنٛز۔ پَٹوٲری یٲنٛد تَحصیلٕ دَفترٕ پٮ۪ٹٕٛ مَدَد لٲوٕ — پَنٕنٛ شِنٲختٕ تٮ۪ پٮ۪ٹٛ زَمینٕچ کٲغَز تَیٲر رَکھٲوٕ۔',
    },
    locale,
  )
}

export function demoZameen(locale: UiLocale): string {
  return pick(
    {
      en: 'Your apple leaves show early signs of fungal infection. Apply a copper-based spray within three days and avoid over-watering. Today at Sopore mandi, apple is roughly ₹42 per kg.',
      hi: 'आपके सेब के पत्तों पर फंगल संक्रमण के शुरुआती लक्षण हैं। तीन दिन के अंदर कॉपर आधारित स्प्रे लगाएँ और पानी ज़्यादा न दें। आज सोपोर मंडी में सेब लगभग ₹42 प्रति किलो है।',
      ks: 'تُہٕنٛد سٮ۪بٕچ پَتٮ۪نٛد پٮ۪ٹٛ فَنٛگَل اِنٛفٮ۪کشنٕچ شُروعٲتی نِشٲنٛدٲنٛ۔ تٕرٮ۪نٛدٕنٛدٕر کاپَرٕ ہٮ۪نٛد سٕپرٮ۪ لَگٲوٕ تٮ۪ پٲنٮ۪ زٮ۪ادہ نٮ۪ دٮ۪یٕوٕ۔ اَز سٮ۪پور مَنٛڈٮ۪ پٮ۪ٹٛ سٮ۪ب لَگ بَگ ₹42 کلوٗ۔',
    },
    locale,
  )
}

export function demoPmKisan(locale: UiLocale): string {
  return pick(
    {
      en: 'PM-KISAN pays registered farmers ₹6,000 per year in three instalments of ₹2,000. Check your name on the beneficiary list and land records. You can check status on pmkisan.gov.in or ask at your nearest CSC.',
      hi: 'पीएम किसान योजना में पंजीकृत किसानों को साल में ₹6000 तीन किस्तों में (₹2000-₹2000) मिलता है। लाभार्थी सूची और ज़मीन के रिकॉर्ड सही रखें। pmkisan.gov.in पर स्टेटस देखें या नज़दीकी सीएससी से पूछें।',
      ks: 'پیٖ ایم کِسانٕ مَنٛز رٮ۪جِسٹرٕد کِسانَنٛ ہٮ۪ چھُ سٲلٕس ₹6000 تٕرٮ۪ قِسطَنٛ مَنٛز (₹2000)۔ فٲیدٕ مَنٛد فٮ۪ہرٕسٕ تٮ۪ زَمینٕچ رٮ۪کارٕڈ درٲست رَکھٲوٕ۔ pmkisan.gov.in پٮ۪ٹٛ حٲلَت وٲچھٲوٕ یٲنٛد نٮ۪زدیکٮ۪ سی ایس سی۔',
    },
    locale,
  )
}

export function demoRaahApple(locale: UiLocale): string {
  return pick(
    {
      en: 'This season, watch spray timing and moisture on your apple crop. Use Zameen mode and send a leaf photo to check for disease.',
      hi: 'इस मौसम में सेब की फसल पर स्प्रे और नमी पर ध्यान दें। ज़मीन मोड में पत्ती की तस्वीर भेजकर बीमारी जाँच सकते हैं।',
      ks: 'اَم مَوسَمَس مَنٛز سٮ۪بٕچ فَسَلَس پٮ۪ٹٛ سٕپرٮ۪ تٮ۪ نٲمیٖ نَظَر رَکھٲوٕ۔ زَمینٕ موٛڈَس مَنٛز پَتٮ۪ٕچ تَصویرٕ بھیٲجٲوٕ بٮ۪مٲریٕچ پٲنٲیٕ۔',
    },
    locale,
  )
}

export function demoRaahDocument(locale: UiLocale): string {
  return pick(
    {
      en: 'Open Samjho mode and photograph your document — we will explain it in simple language.',
      hi: 'समझो मोड खोलें और अपने दस्तावेज़ की फोटो लें — हम सरल भाषा में समझाएँगे।',
      ks: 'سَمٮ۪جٮ۪ موٛڈ کھٲلٲوٕ تٮ۪ پَنٕنٛ دَستٲوٮ۪زٕچ تَصویرٕ — اَسٕ چھُ سٲدٕ زَبانٕ مَنٛز سَمٲجٲوٕنٕ۔',
    },
    locale,
  )
}

export function demoRaahGeneric(locale: UiLocale): string {
  return pick(
    {
      en: 'I am RAASTA. Use Samjho for documents, Zameen for crops, Taleem for jobs and learning, or ask me anything by voice in Raah.',
      hi: 'मैं रास्ता हूँ। कागज़ के लिए समझो, फसल के लिए ज़मीन, नौकरी और पढ़ाई के लिए तालीम, या राह में आवाज़ से कुछ भी पूछें।',
      ks: 'بٲچھٕ رٲستٲ۔ کٲغَزَس باپَتٕ سَمٮ۪جٮ۪، فَسَلٕ باپَتٕ زَمینٕ، نوکری تٮ۪ تٲلیٖم باپَتٕ تٲلیٖم، یٲنٛد رٲٲحَس مَنٛز اَوٲزٕ سٕتۍ کٲنٛسٕ پٮ۪ٹٛ پُچھٲوٕ۔',
    },
    locale,
  )
}

export function fallbackRaahAnswer(
  question: string,
  locale: UiLocale,
): string {
  const q = question.toLowerCase()
  if (q.includes('pm kisan') || q.includes('kisan') || q.includes('yojana')) {
    return demoPmKisan(locale)
  }
  if (q.includes('seb') || q.includes('apple') || q.includes('fasal')) {
    return demoRaahApple(locale)
  }
  if (q.includes('kagaz') || q.includes('notice') || q.includes('document')) {
    return demoRaahDocument(locale)
  }
  return demoRaahGeneric(locale)
}

export function taleemDemoFor(
  locale: UiLocale,
  pillar: string,
  sub: string,
): string {
  const p = pillar
  const s = sub
  if (p === 'hunarmand' && s === 'idea') {
    return pick(
      {
        en: 'Solid idea — Kashmir has plenty of apples and less processing, so juice or puree can find real demand. Watch local beverage competition. First step: a small pilot batch, basic FSSAI registration, and correct packaging labels. Next: draft a one-page plan for PM Mudra or youth schemes — use the Schemes tab with your age and district.',
        hi: 'अच्छा विचार — कश्मीर में सेब ज़्यादा और प्रोसेसिंग कम है, इसलिए जूस/प्यूरी की माँग असली हो सकती है। प्रतिस्पर्धा देखें। पहला कदम: छोटा पायलट बैच, बुनियादी एफएसएसएआई पंजीकरण, पैकेजिंग लेबल। आगे: पीएम मुद्रा/युवा योजनाओं के लिए एक पेज का प्लान — योजनाएँ टैब में उम्र और ज़िला लिखें।',
        ks: 'اَصٕل خٲیالٕ — کٲشٕرٕ مَنٛز سٮ۪ب زٮ۪ادہ، پروٛسیٖسٕنگ کٲم۔ مارکیٖٹٕ دٲرٲفٕ حٲقٮ۪قٕ۔ پٮ۪ٹٲم قَدَم: چھوٛٹٮ۪ پٲیٖلٲٹ، FSSAI، پٲکٮ۪جٮ۪نٛگ۔ PM Mudra / یٮ۪وٲ یٮ۪وجَنٲنٕ — یٮ۪وجَنٲنٕ ٹٮ۪بَس مَنٛز عُمر تٮ۪ ضِلٕع۔',
      },
      locale,
    )
  }
  if (p === 'hunarmand' && s === 'schemes') {
    return pick(
      {
        en: 'For your age and business, check: PM Mudra (starter loans), Mission YUVA–style youth programmes, and J&K startup or DIC portals. First step: Udyam registration at your district DIC or CSC. Meet a mentor to learn forms — use Mentor resources when available.',
        hi: 'आपकी उम्र और व्यवसाय के लिए देखें: पीएम मुद्रा, मिशन युवा जैसी योजनाएँ, जम्मू-कश्मीर स्टार्टअप या डीआईसी पोर्टल। पहला कदम: ज़िला डीआईसी/सीएससी पर उद्यम पंजीकरण। मेंटर से फॉर्म सीखें।',
        ks: 'تُہٕنٛد عُمر تٮ۪ کاروبارٕ باپَتٕ: PM Mudra، Mission YUVA، J&K startup / DIC پورٹَلٕ۔ پٮ۪ٹٲم: ضِلٕع DIC / CSC پٮ۪ٹٛ Udyam رٮ۪جٮ۪سٕٹریٚشن۔ مٮ۪نٛٹَرٕ سٕتۍ فٲرٲم سٮ۪کھٲوٕ۔',
      },
      locale,
    )
  }
  if (p === 'sukoon' && s === 'checkin') {
    return pick(
      {
        en: 'I hear you — job stress hurts, and you are not alone. Try three slow breaths: four counts in, hold four, four out. One small step today: try the Kaam Dhundo skill tab. If you feel overwhelmed, the helpline below is one tap — asking for help is strength.',
        hi: 'मैं समझता हूँ — नौकरी की चिंता दुखदायी है, आप अकेले नहीं हैं। तीन धीमी साँसें: चार गिनती अंदर, रोककर चार, चार बाहर। आज एक छोटा कदम: काम ढूँढो में अपना हुनर लिखें। अगर बहुत भारी लगे तो हेल्पलाइन एक टैप दूर है।',
        ks: 'مٲنٛز آٲیٕ — نوکریٕ ہٮ۪نٛد دُکھ چھُ، تُہۍ اکٲلٕ نٮ۪۔ تٕرٲنٛدٕ ہَوٲنٛد سٲنٛس: چٲر اَندر، رٲکٲوٕ چٲر، چٲر بٲنٛرٕ۔ اَز چھُٲکٕ قَدَم: کاٲم ڈھونٛٮ۪نٮ۪ مَنٛز پَنٕنٛ ہُنَر لٲکھٲوٕ۔ یٮ۪دیٚ لَگٕ زٮ۪ادہ بٲرٕ تٮ۪ ہٮ۪لٕپ لٲیٖنٕ۔',
      },
      locale,
    )
  }
  if (p === 'kaam' && s === 'skill') {
    return pick(
      {
        en: 'Phone repair maps to “mobile / electronics repair technician”. Small shops near Sopore or Baramulla often need helpers — visit one shop a week and ask politely. Online, start with Fiverr or trusted local groups for services like screen replacement. The Freelance tab explains profiles step by step.',
        hi: 'फोन रिपेयर “मोबाइल/इलेक्ट्रॉनिक्स रिपेयर टेक्नीशियन” श्रेणी में आता है। सोपोर/बारामूला के छोटे दुकानों में सहायक चाहिए हो सकता है — हफ्ते में एक दुकान पर जाकर पूछें। ऑनलाइन फिवर्र या भरोसेमंद समूह से शुरुआत करें।',
        ks: 'فونٕ ٹھیک کَرٲنٕ چھُ "موبٲئل/برٲقٮ۪یٲیٲیٕ ٹٮ۪کٮ۪نیٖشَن"۔ سٮ۪پور/بٲرٲمولٲلٕ نٮ۪زدیک چھوٛٹٕ دُکٲنٕ helper چٲنٛدٲنٛ۔ اَنٲیٖن Fiverr۔',
      },
      locale,
    )
  }
  if (p === 'kaam' && s === 'gig') {
    return pick(
      {
        en: 'Demo gigs: (1) Delivery partner — flexible hours, apply in the app. (2) Tourism season — local guide or homestay help. (3) Remote micro tasks — use trusted job portals and groups. Always verify the employer name and address — never pay upfront fees.',
        hi: 'डेमो गिग: (1) डिलीवरी पार्टनर — लचीले घंटे। (2) पर्यटन सीज़न — गाइड/होमस्टे। (3) रिमोट छोटे काम — भरोसेमंद पोर्टल। नियोक्ता सत्यापित करें — अग्रिम पैसा न दें।',
        ks: 'ڈٮ۪مو گِگ: (1) ڈٮ۪لیٖوری (2) سیٖزَنَس گٲیٖڈ (3) رٮ۪موٛٹٕ۔ مٲلٕکٕچ پٲنٛتٮ۪ٛ سٲتٕ — اَگٮ۪مٕ پٲیسٕ نٮ۪ دٮ۪یٕوٕ۔',
      },
      locale,
    )
  }
  if (p === 'kaam' && s === 'freelance') {
    return pick(
      {
        en: 'On Fiverr: create an account, clear profile photo, write three lines of service in English (think in your language, write in English). First gig: a simple $5 task to earn reviews. Improve your profile 30 minutes daily.',
        hi: 'फिवर्र: खाता, साफ़ फोटो, अंग्रेज़ी में तीन पंक्तियाँ। पहला गिग: सरल $5 काम। रोज़ 30 मिनट प्रोफ़ाइल सुधारें।',
        ks: 'Fiverr: اَکٲوٲنٛٹ، صٲفٕ فوٛٹوٗ، اَنٮ۪گریٖزٮ۪ مَنٛز تٕرٮ۪نٛدٕ لٲیٖنٕ۔ پٮ۪ٹٲم گِگ: $5۔',
      },
      locale,
    )
  }
  if (p === 'naukri') {
    return pick(
      {
        en: 'For your qualification (demo): watch JKSSB Class IV and similar ads — put deadlines on a calendar. Police and forest jobs use other portals. Next: jkssb.nic.in and official J&K notices. Use Exam prep for daily practice.',
        hi: 'आपकी योग्यता के लिए (डेमो): जेकेएसएसबी क्लास IV जैसी भर्तियाँ देखें — डेडलाइन कैलेंडर में लिखें। पुलिस/वन अलग पोर्टल। आगे: jkssb.nic.in और आधिकारिक सूचनाएँ।',
        ks: 'تٲلیٖمٕ باپَتٕ (ڈٮ۪مو): JKSSB Class IV اَنٲنٛٮ۪۔ ڈٮ۪ڈلٲیٖنٕ کیٚلٮ۪نٛڈَرٕ۔ jkssb.nic.in۔',
      },
      locale,
    )
  }
  if (p === 'cv') {
    return pick(
      {
        en: 'CURRICULUM VITAE (draft — edit before use)\n\nNAME: [Your name]\nLOCATION: Kashmir, India\n\nPROFILE\nMotivated young person with practical skills and willingness to learn.\n\nEXPERIENCE\n— Informal work and volunteering (add detail).\n\nSKILLS\n— Communication; smartphones and basic computers; quick learner.\n\nEDUCATION\n— [Your school/college]\n\nLANGUAGES\n— As applicable\n\nREFERENCES\nOn request\n\n— RAASTA Taleem demo.',
        hi: 'बायोडाटा (ड्राफ़्ट)\n\nनाम: []\nस्थान: कश्मीर, भारत\n\nप्रोफ़ाइल\nप्रेरित युवा, व्यावहारिक कौशल।\n\nअनुभव — अनौपचारिक कार्य।\n\nकौशल — संचार; फोन/कंप्यूटर।\n\nशिक्षा — []\n\nभाषाएँ — []\n\n— रास्ता तालीम डेमो।',
        ks: 'سیٖ ویٚ (ڈٲفٕٹ)\n\nناوٕ: []\nجٲیٖ: کٲشٕرٕ\n\nپروٛفٲئل\n\n— RAASTA Taleem demo',
      },
      locale,
    )
  }
  if (p === 'exam') {
    return pick(
      {
        en: 'Good attempt — examiners use a detailed marking scheme. You touched the main idea. For General Knowledge, practise ten questions daily and read current affairs. Next: pick one topic from the JKSSB syllabus PDF and revise aloud for five minutes.',
        hi: 'अच्छा प्रयास — मूल बिंदु छुआ। सामान्य ज्ञान के लिए रोज़ दस प्रश्न और करेंट अफेयर्स पढ़ें। अगला: जेकेएसएसबी सिलेबस से एक विषय चुनकर ज़ोर से पाँच मिनट दोहराएँ।',
        ks: 'نٲرٕ کوٛشٕشٕ — مُکھ نُکتٕ چھُٮ۪۔ GK باپَتٕ دٲنٛدٲنٛ 10 سوٲلٕ۔ JKSSB syllabusٕ پٮ۪ٹٛ اَکٕ موضوٗع۔',
      },
      locale,
    )
  }
  if (p === 'scholarship') {
    return pick(
      {
        en: 'With roughly 78% in Science (demo marks), explore: National Scholarship Portal (means/merit), state post-matric schemes, and any minority or tribal schemes that apply. Deadlines are often Sept–Nov — create your NSP account early. Keep income proof and bank details ready from your college office. Always confirm rules on the official portal.',
        hi: 'लगभग 78% साइंस (डेमो) के साथ: राष्ट्रीय छात्रवृत्ति पोर्टल, राज्य पोस्ट-मैट्रिक, अल्पसंख्यक/जनजाति योजनाएँ जहाँ लागू हों। सितंबर–नवंबर डेडलाइन अक्सर — एनएसपी खाता जल्दी बनाएँ। आय प्रमाण और बैंक विवरण तैयार रखें।',
        ks: 'تَقریبٲ 78٪ سٲیٖنٛس (ڈٮ۪مو): NSP، رٮ۪یاستٕ پوسٕٹ میٚٹرٮ۪کٕ۔ سٮ۪پٮ۪ٹٲمٕ–نَوٲمٕبَرٕ۔ آمدٲنٕ ثٲبٕوت تٮ۪ بٲنٛکٕ تٲیٲرٕ۔',
      },
      locale,
    )
  }
  return pick(
    {
      en: `Unknown Taleem mode "${p}".`,
      hi: `अज्ञात मोड "${p}"۔`,
      ks: `نامَعلٲم موٛڈ "${p}"۔`,
    },
    locale,
  )
}
