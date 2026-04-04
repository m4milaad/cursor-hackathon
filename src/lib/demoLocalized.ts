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

export function fallbackRaahAnswer(question: string, locale: UiLocale, systemPrompt?: string): string {
  const q = question.toLowerCase()

  if (systemPrompt) {
    if (systemPrompt.includes('Life Direction Engine')) {
      return `Here is an analysis based on your situation:

1. **Option 1: Government Job**
   * **Pros:** Job security, steady income, pension benefits, social respect.
   * **Cons:** Highly competitive to get, slow growth, potential transfers.
   * **Outcome:** Stable, predictable lifestyle.

2. **Option 2: Start a Business**
   * **Pros:** Unlimited growth potential, independence, pursuing your passion.
   * **Cons:** High risk, uncertain income initially, requires capital.
   * **Outcome:** Higher reward potential but requires resilience.

**Recommendation:**
If you need stability to support your family immediately, focus on government exams. If you have some savings, a safety net, and a strong idea, starting small with a business in your local area could be rewarding.

**Timeline:**
Take 6 months to give an honest attempt at an exam. If things don't look positive, pivot part-time to exploring your business idea.`
    }
    
    if (systemPrompt.includes('Overthinking Breaker')) {
      return `I hear you, and it's completely normal to feel this way. Let's break this down:

**Fears vs Facts:**
* **Fear:** "I am going to fail and ruin my future."
* **Fact:** You have a challenge ahead, but you possess the skills to tackle it step-by-step.

**Actionable Steps:**
1. Put the long-term worry aside for the next 4 hours.
2. Focus on just ONE small task you can complete right now.
3. Take a 10-minute walk to reset.
   
Remember: You don't have to have everything figured out today.`
    }

    if (systemPrompt.includes('Path Builder') || systemPrompt.includes('Goal Guidance AI')) {
      const isBusiness = question.toLowerCase().includes('business plan')
      const isScholarship = question.toLowerCase().includes('scholarships')
      const isResources = question.toLowerCase().includes('resources')
      
      // Attempt to extract the actual goal
      let goalText = question.split('\\n')[0].replace(/Create a.*?who wants to:/i, '').replace(/[^a-zA-Z0-9 ]/g, '').trim()
      if (!goalText || goalText.length < 3) goalText = 'achieve this goal'

      if (isBusiness) {
        return `Here is a business plan outline for you to **${goalText}**:

**1. Executive Summary**
* Clarify your vision to ${goalText}.
* Target Audience: Local market in Kashmir/India.

**2. Initial Setup & Costs**
* Basic infrastructure and tools: ₹10,000 - ₹50,000
* Marketing (Local & Social Media): ₹5,000

**3. Execution Timeline**
* **Month 1:** Market research, securing tools/space, and registering the business.
* **Month 2-3:** Launching MVP (Minimum Viable Product), gathering first customers.
* **Month 4+:** Scaling based on revenue.

**4. Government Schemes to Explore**
* Startup India Seed Fund
* Mudra Yojana (Shishu tier for early stage)
* J&K Entrepreneurship Development Institute (JKEDI) schemes`
      }

      if (isScholarship) {
         return `Here are some financial aid options and scholarships to help you **${goalText}**:

**1. Government Scholarships (NSP)**
* Post-Matric / Pre-Matric Scholarships.
* Prime Minister's Special Scholarship Scheme (PMSSS) for J&K students.

**2. Institutional Aid**
* Fellowships from specific universities you apply to.
* UGC grants for higher education.

**3. Specialized Funds**
* AICTE Pragati Scholarship for Girls.
* Local NGO educational funds in your district.

*Action Step:* Visit scholarships.gov.in and create your profile this week.`
      }

      if (isResources) {
         return `Top free resources to help you **${goalText}**:

**1. Online Platforms**
* YouTube (Search for detailed Indian educators/channels on ${goalText})
* Coursera (Apply for Financial Aid for free certificates)
* NPTEL / Swayam (Government of India free courses)

**2. Tools & Communities**
* Search Telegram for local J&K/India study or network groups.
* Use free AI tools (like Raasta!) for mock interviews or practice.

Start dedicating 45 minutes a day to any one of these platforms.`
      }

      // Default Roadmap
      return `Here is your detailed roadmap to **${goalText}**:

**1. Learn the Basics (Weeks 1-4)**
* Start with foundational concepts regarding ${goalText}.
* Practice 1 hour daily.
* **Quick Win:** Find one mentor or join one community related to this.

**2. Build & Apply (Months 2-3)**
* Apply what you learned into 2-3 small practical tests or projects.
* Stay consistent even when it feels slow.

**3. Explore Opportunities (Month 4+)**
* Look into PMKVY or local programs for certifications if needed.
* Start networking with local hubs or applying for entry-level positions.

Keep going, steady progress is better than perfection.`
    }
    
    if (systemPrompt.includes('Decision Helper')) {
      return `Let's compare the choices side-by-side:

**Short-term Impact:**
* Option A gives you immediate momentum but less stability.
* Option B requires more patience but offers a safer foundation.

**Long-term Impact:**
* Option A leads to a compound advantage in skills.
* Option B provides a predictable trajectory without major surprises.

**Recommendation:**
Based on your input, having a stable foundation while acquiring new skills on the side is often the most practical approach. Consider choosing the safer route to secure your footing, then pivot slowly.`
    }
    
    if (systemPrompt.includes('Life Journal') || systemPrompt.includes('Daily Check-in')) {
      return `Thank you for sharing that with me. Acknowledging your thoughts is a big step. 

* **Insight:** You're processing a lot right now. Give yourself credit for showing up.
* **Reflection:** What is one small thing you can do for yourself today to ease that pressure?

Tip: Try to take 5 minutes just to breathe without any screens or distractions.`
    }
  }

  if (q.includes('pm kisan') || q.includes('kisan') || q.includes('yojana')) return demoPmKisan(locale)
  if (q.includes('seb') || q.includes('apple') || q.includes('fasal')) return demoRaahApple(locale)
  if (q.includes('kagaz') || q.includes('notice') || q.includes('document')) return demoRaahDocument(locale)
  return demoRaahGeneric(locale)
}
