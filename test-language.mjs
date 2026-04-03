// Quick test to verify OpenAI API is working with language enforcement
import { openai } from '@ai-sdk/openai'
import { generateText } from 'ai'
import { readFileSync } from 'fs'

// Load .env.local
const envContent = readFileSync('.env.local', 'utf-8')
const lines = envContent.split('\n')
for (const line of lines) {
  const match = line.match(/^([^#=]+)=(.+)$/)
  if (match) {
    const [, key, value] = match
    process.env[key.trim()] = value.trim()
  }
}

if (!process.env.OPENAI_API_KEY) {
  console.error('❌ No OpenAI API key found in .env.local')
  process.exit(1)
}

const MODEL = openai('gpt-4o-mini')

async function testLanguage() {
  console.log('Testing Urdu language enforcement...\n')
  
  const languageEnforcement = `🚨 ABSOLUTE REQUIREMENT 🚨

YOU ARE FORBIDDEN FROM USING ENGLISH OR LATIN SCRIPT.

YOUR ENTIRE RESPONSE MUST BE IN URDU (اردو) USING ARABIC SCRIPT ONLY.

EXAMPLE OF CORRECT FORMAT:
"یہ ایک سرکاری دستاویز ہے۔ اس میں اہم معلومات شامل ہیں۔ براہ کرم تاریخیں احتیاط سے پڑھیں۔"

BEGIN YOUR URDU RESPONSE BELOW (NO ENGLISH ALLOWED):
---`

  const system = `${languageEnforcement}\n\nYou are Samjho, powered by HAQQ. Explain government or legal documents in simple language for people with low literacy. Short paragraphs, warm and clear. Include deadlines and next steps.`
  
  const user = `Document text:
Notice: Land records must be submitted by 15th of this month.

Explain what this means and what the reader should do.

[IMPORTANT: Respond ONLY in Urdu (اردو) script. Example: "یہ ایک دستاویز ہے۔"]`

  try {
    const result = await generateText({
      model: MODEL,
      system,
      prompt: user,
      temperature: 0.4,
    })
    
    console.log('Response:')
    console.log(result.text)
    console.log('\n---')
    
    // Check if response contains English
    const hasEnglish = /[a-zA-Z]{3,}/.test(result.text)
    if (hasEnglish) {
      console.log('❌ FAILED: Response contains English text')
    } else {
      console.log('✅ SUCCESS: Response is in Urdu script')
    }
  } catch (error) {
    console.error('Error:', error.message)
  }
}

testLanguage()
