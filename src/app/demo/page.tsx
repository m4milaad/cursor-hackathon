'use client'

import { GreenSpeakButton } from '@/components/GreenSpeakButton'
import Link from 'next/link'

export default function DemoPage() {
  const exampleQueries = [
    {
      category: 'Zameen (Agriculture)',
      queries: [
        'Meri fasal kharab ho rahi hai',
        'Seb ke darakht ki bimari',
        'Sopore mandi mein aaj kya bhav hai',
        'Kesar ki kheti kaise karein',
        'My crop is dying',
      ],
    },
    {
      category: 'Taleem (Career/Education)',
      queries: [
        'Mujhe naukri chahiye',
        'CV kaise banayein',
        'Main graphic designer hun',
        'Scholarship ke liye apply karna hai',
        'I need a job',
      ],
    },
    {
      category: 'Samjho (Documents)',
      queries: [
        'Ye notice kya kehta hai',
        'Is kagaz ko samjhao',
        'Document translate karo',
        'What does this certificate say',
      ],
    },
    {
      category: 'Raah (Guidance)',
      queries: [
        'Main pareshan hun',
        'Mujhe samajh nahi aa raha',
        'PM Kisan scheme ke baare mein batao',
        'I feel confused about my future',
        'Kya karu',
      ],
    },
  ]

  return (
    <main className="min-h-screen bg-[#fbf9f4] py-12 px-6">
      <GreenSpeakButton />

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-[var(--color-secondary)] hover:underline mb-6"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Back to Home
          </Link>

          <h1 className="font-headline text-5xl font-bold text-[var(--color-primary)] mb-4">
            Green Speak Button Demo
          </h1>
          <p className="text-lg text-[var(--color-on-surface-variant)] leading-relaxed">
            Test the universal AI entry point. Click the green button in the bottom-right corner and speak any of these example queries.
          </p>
        </div>

        {/* How it Works */}
        <div className="raasta-card p-8 mb-8">
          <h2 className="font-headline text-2xl font-bold text-[var(--color-primary)] mb-4">
            How It Works
          </h2>
          <ol className="space-y-3 text-[var(--color-on-surface-variant)]">
            <li className="flex gap-3">
              <span className="font-bold text-[var(--color-secondary)]">1.</span>
              <span>Click the green microphone button in the bottom-right corner</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-[var(--color-secondary)]">2.</span>
              <span>Speak your query in Urdu, Hindi, Kashmiri, or English</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-[var(--color-secondary)]">3.</span>
              <span>AI detects your intent and routes you to the right module</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-[var(--color-secondary)]">4.</span>
              <span>You're automatically navigated to the relevant page</span>
            </li>
          </ol>
        </div>

        {/* Example Queries */}
        <div className="space-y-6">
          <h2 className="font-headline text-3xl font-bold text-[var(--color-primary)]">
            Example Queries
          </h2>

          {exampleQueries.map((section) => (
            <div key={section.category} className="raasta-card p-6">
              <h3 className="font-headline text-xl font-bold text-[var(--color-secondary)] mb-4">
                {section.category}
              </h3>
              <ul className="space-y-2">
                {section.queries.map((query, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-3 text-[var(--color-on-surface-variant)]"
                  >
                    <span className="material-symbols-outlined text-[var(--color-secondary)] text-sm mt-0.5">
                      mic
                    </span>
                    <span className="italic">"{query}"</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Technical Details */}
        <div className="raasta-card p-8 mt-8">
          <h2 className="font-headline text-2xl font-bold text-[var(--color-primary)] mb-4">
            Technical Details
          </h2>
          <div className="space-y-4 text-[var(--color-on-surface-variant)]">
            <div>
              <h3 className="font-bold text-[var(--color-on-surface)] mb-2">Voice Input</h3>
              <p>Uses browser SpeechRecognition API with Urdu language support (ur-PK)</p>
            </div>
            <div>
              <h3 className="font-bold text-[var(--color-on-surface)] mb-2">Intent Detection</h3>
              <p>
                <strong>Production Mode:</strong> OpenAI GPT-4o-mini analyzes the query and detects intent with 85%+ accuracy
                <br />
                <strong>Demo Mode:</strong> Keyword-based matching for offline functionality
              </p>
            </div>
            <div>
              <h3 className="font-bold text-[var(--color-on-surface)] mb-2">Smart Routing</h3>
              <p>Automatically navigates to the appropriate module based on detected intent</p>
            </div>
            <div>
              <h3 className="font-bold text-[var(--color-on-surface)] mb-2">Supported Intents</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Samjho:</strong> Document understanding, translation</li>
                <li><strong>Zameen:</strong> Agriculture, crops, mandi prices</li>
                <li><strong>Taleem:</strong> Career, jobs, education, CV</li>
                <li><strong>Raah:</strong> Life guidance, schemes, support</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Browser Compatibility */}
        <div className="mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-bold text-yellow-900 mb-2 flex items-center gap-2">
            <span className="material-symbols-outlined">info</span>
            Browser Compatibility
          </h3>
          <p className="text-sm text-yellow-800">
            Voice recognition works best in Chrome, Edge, and Safari. If your browser doesn't support voice input, 
            you can still test the intent detection by typing queries in the Raah module.
          </p>
        </div>
      </div>
    </main>
  )
}
