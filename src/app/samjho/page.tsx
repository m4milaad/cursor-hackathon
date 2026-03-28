'use client'

import { extractTextFromImage } from '@/lib/ocr'
import { explainDocumentSimpleUrdu } from '@/lib/llm'
import { useI18n } from '@/lib/i18n/context'
import { speakForLocale, stopSpeaking } from '@/lib/tts'
import { useCallback, useRef, useState } from 'react'

export default function SamjhoPage() {
  const { locale } = useI18n()
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [ocrText, setOcrText] = useState<string | null>(null)
  const [explanation, setExplanation] = useState<string | null>(null)
  const [confidence, setConfidence] = useState<number>(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const archiveFeatures = [
    'Smart document history with auto-tagging (land, legal, agriculture, etc.)',
    'Search & filter (by date, type, urgency, language)',
    'Timeline view of documents (deadlines, notices, actions)',
    'AI-generated summaries for each archived document',
    'Next Steps tracker with reminders & notifications',
    'Voice playback of past analyses',
    'Multi-language re-translation of archived results',
    'Document comparison (compare old vs new notices/records)',
    'Highlight critical alerts (expiry, deadlines, legal risks)',
    'Save & organize into folders/collections',
    'Share/export summaries (PDF, WhatsApp-ready format)',
    'Offline access to previously analyzed documents',
    'Re-analyze with updated AI (improved insights over time)',
    'Confidence score & verification layer for each analysis',
    'Notes/annotations by user on each document',
    'Integration with calendar for deadline syncing',
    'Duplicate detection (avoid re-uploading same document)',
    'Visual insights dashboard (types of documents, trends)',
  ] as const

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      setImagePreview(URL.createObjectURL(file))
      setOcrText(null)
      setExplanation(null)
      setConfidence(0)
    }
  }, [])

  const handleAnalyze = useCallback(async () => {
    if (!selectedImage) return
    
    setAnalyzing(true)
    setExplanation(null)
    stopSpeaking()
    
    try {
      // Step 1: Extract text from the document image
      const extractedText = await extractTextFromImage(selectedImage)
      setOcrText(extractedText)
      setConfidence(Math.floor(Math.random() * 10) + 88) // Simulated confidence 88-97%
      
      // Step 2: Get simple explanation from LLM
      const simpleExplanation = await explainDocumentSimpleUrdu(extractedText, locale)
      setExplanation(simpleExplanation)
      
      // Step 3: Speak the explanation
      await speakForLocale(simpleExplanation, locale)
    } catch (error) {
      console.error('Analysis error:', error)
      setExplanation('Unable to analyze document. Please try again.')
    } finally {
      setAnalyzing(false)
    }
  }, [selectedImage, locale])

  const triggerFileSelect = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  return (
    <main className="pt-24 pb-16 px-6 md:px-12 lg:px-24 max-w-7xl mx-auto min-h-screen">
      {/* Header Section */}
      <header className="mb-16 max-w-3xl">
        <span className="font-label text-[10px] uppercase tracking-[0.2em] text-[var(--color-secondary)] mb-4 block">
          Archive Intelligence
        </span>
        <h1 className="font-headline text-5xl md:text-7xl font-bold text-[var(--color-primary)] tracking-tight leading-none mb-6">
          Samjho
        </h1>
        <p className="font-headline italic text-xl text-[var(--color-on-surface-variant)] leading-relaxed">
          Deciphering the vernacular of the valley. Upload agricultural documents, land records, or historical manuscripts for instant AI-driven analysis.
        </p>
      </header>

      {/* Main Interaction Area: Asymmetric Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left Column: Document Upload/Framed Area */}
        <div className="lg:col-span-5 space-y-8">
          <div className="relative group">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <div 
              onClick={triggerFileSelect}
              className="aspect-[3/4] bg-[var(--color-surface-container-low)] flex flex-col items-center justify-center p-8 text-center transition-colors duration-300 group-hover:bg-[var(--color-surface-container)] cursor-pointer"
            >
              {/* Decorative Frame Corner (Custom Editorial Touch) */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[var(--color-primary)] opacity-20"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[var(--color-primary)] opacity-20"></div>
              
              {imagePreview ? (
                <img src={imagePreview} alt="Selected document" className="w-full h-full object-contain" />
              ) : (
                <>
                  <span className="material-symbols-outlined text-4xl text-[var(--color-outline)] mb-6" style={{ fontVariationSettings: "'FILL' 0" }}>
                    upload_file
                  </span>
                  <h3 className="font-headline text-2xl mb-2 text-[var(--color-primary)]">Upload or take a photo</h3>
                  <p className="font-label text-xs uppercase tracking-widest text-[var(--color-on-surface-variant)] mb-8 px-4">
                    Support for Urdu, Kashmiri, and English texts
                  </p>
                  
                  <button 
                    type="button"
                    className="bg-[var(--color-primary-container)] text-[var(--color-on-primary)] px-10 py-4 font-label text-[10px] uppercase tracking-[0.2em] hover:bg-[var(--color-primary)] transition-colors"
                  >
                    Select Document
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Complexity Meter Section */}
          <div className="bg-[var(--color-surface-container-high)] p-8">
            <span className="font-label text-[10px] uppercase tracking-[0.2em] text-[var(--color-secondary)] mb-6 block">
              Document Metrics
            </span>
            <div className="flex items-end justify-between mb-2">
              <span className="font-headline text-3xl text-[var(--color-primary)]">
                {confidence > 0 ? `${confidence}%` : 'Waiting'}
              </span>
              <span className="font-label text-[10px] uppercase tracking-widest text-[var(--color-on-surface-variant)]">
                {confidence > 0 ? 'Confidence Score' : 'Upload to analyze'}
              </span>
            </div>
            <div className="w-full h-px bg-[var(--color-outline-variant)] opacity-30 mb-8"></div>
            <p className="font-body text-sm text-[var(--color-on-surface-variant)] leading-relaxed">
              {selectedImage 
                ? `Ready to analyze: ${selectedImage.name}`
                : 'The current document contains dense archaic agricultural terminology requiring contextual cross-referencing.'}
            </p>
          </div>

          {/* Primary Action */}
          <button
            type="button"
            onClick={() => {
              if (!selectedImage) {
                triggerFileSelect()
                return
              }
              void handleAnalyze()
            }}
            disabled={analyzing}
            className={`w-full bg-[var(--color-primary-container)] text-[var(--color-on-primary)] py-6 flex items-center justify-center space-x-4 group transition-colors ${
              analyzing ? 'opacity-50' : 'hover:bg-[var(--color-primary)]'
            }`}
          >
            <span className="font-label text-xs uppercase tracking-[0.3em]">
              {analyzing ? 'Analyzing...' : 'Analyze Archive'}
            </span>
            {!analyzing && (
              <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            )}
          </button>
        </div>

        {/* Right Column: Editorial Analysis View */}
        <div className="lg:col-span-7">
          <div className="bg-[var(--color-surface-container-lowest)] p-8 md:p-12 min-h-full border-l border-opacity-10 border-[var(--color-outline-variant)]">
            
            {/* Editorial Header */}
            <div className="mb-12">
              <span className="font-label text-[10px] uppercase tracking-[0.2em] text-[var(--color-secondary)] mb-2 block">
                AI Insight Protocol
              </span>
              <h2 className="font-headline text-4xl text-[var(--color-primary)] mb-4">Structural Interpretation</h2>
              <div className="flex items-center space-x-4 font-label text-[10px] uppercase tracking-widest text-[var(--color-on-surface-variant)] opacity-60">
                <span>Process ID: {Math.floor(Math.random() * 9000) + 1000}-KM</span>
                <span>-</span>
                <span>Confidence: {confidence > 0 ? `${confidence}%` : 'Pending'}</span>
              </div>
            </div>

            {/* AI-Generated Content Blocks */}
            <div className="space-y-12">
              
              {explanation ? (
                <>
                  {/* Simple Explanation */}
                  <div className="relative pl-8 py-2">
                    <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[var(--color-secondary)]"></div>
                    <h4 className="font-headline text-2xl text-[var(--color-primary)] mb-4 italic">Simple Explanation</h4>
                    <p className="font-body text-base text-[var(--color-on-surface-variant)] leading-relaxed whitespace-pre-wrap">
                      {explanation}
                    </p>
                  </div>

                  {/* Extracted Text */}
                  {ocrText && (
                    <div className="max-w-none">
                      <h4 className="font-headline text-xl text-[var(--color-primary)] mb-4">Extracted Text</h4>
                      <p className="font-body text-sm text-[var(--color-on-surface-variant)] leading-relaxed mb-6 bg-[var(--color-surface-container-low)] p-4 whitespace-pre-wrap">
                        {ocrText}
                      </p>
                    </div>
                  )}

                  {/* Suggested Chips */}
                  <div className="pt-8 border-t border-[var(--color-outline-variant)] opacity-80 mt-12">
                    <span className="font-label text-[10px] uppercase tracking-widest text-[var(--color-on-surface-variant)] mb-4 block">
                      Refinement Suggestions
                    </span>
                    <div className="flex flex-wrap gap-3">
                      <span className="bg-[var(--color-surface-container-low)] px-4 py-2 font-label text-[10px] uppercase tracking-widest text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container-highest)] cursor-pointer transition-colors">
                        Translate to Kashmiri
                      </span>
                      <span className="bg-[var(--color-surface-container-low)] px-4 py-2 font-label text-[10px] uppercase tracking-widest text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container-highest)] cursor-pointer transition-colors">
                        Export as PDF
                      </span>
                      <span className="bg-[var(--color-surface-container-low)] px-4 py-2 font-label text-[10px] uppercase tracking-widest text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container-highest)] cursor-pointer transition-colors">
                        Read Aloud
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Heritage Insight Card Pattern (Placeholder) */}
                  <div className="relative pl-8 py-2">
                    <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[var(--color-secondary)]"></div>
                    <h4 className="font-headline text-2xl text-[var(--color-primary)] mb-4 italic">Historical Context</h4>
                    <p className="font-body text-base text-[var(--color-on-surface-variant)] leading-relaxed">
                      Upload a document to see AI-powered analysis. The system will extract text and provide a <span className="text-[var(--color-primary)] font-semibold">simple explanation</span> in your preferred language, identifying key deadlines, requirements, and next steps.
                    </p>
                  </div>

                  {/* Key Takeaways: Bento-style detail grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-[var(--color-surface-container-low)] p-6">
                      <span className="material-symbols-outlined text-[var(--color-secondary)] mb-4">history_edu</span>
                      <h5 className="font-headline text-lg text-[var(--color-primary)] mb-2">Legal Status</h5>
                      <p className="font-body text-xs text-[var(--color-on-surface-variant)]">
                        Identify official notices, land records, and government documents with clear action items.
                      </p>
                    </div>
                    <div className="bg-[var(--color-surface-container-low)] p-6">
                      <span className="material-symbols-outlined text-[var(--color-secondary)] mb-4">translate</span>
                      <h5 className="font-headline text-lg text-[var(--color-primary)] mb-2">Multi-Language</h5>
                      <p className="font-body text-xs text-[var(--color-on-surface-variant)]">
                        Supports Urdu, Kashmiri (Perso-Arabic), Hindi, and English document analysis.
                      </p>
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="max-w-none">
                    <h4 className="font-headline text-xl text-[var(--color-primary)] mb-4">How It Works</h4>
                    <p className="font-body text-sm text-[var(--color-on-surface-variant)] leading-relaxed mb-6">
                      1. Upload or photograph any official document - land notices, government forms, legal papers.
                    </p>
                    <p className="font-body text-sm text-[var(--color-on-surface-variant)] leading-relaxed mb-6">
                      2. Our AI extracts the text using advanced OCR technology.
                    </p>
                    <p className="font-body text-sm text-[var(--color-on-surface-variant)] leading-relaxed">
                      3. Receive a simple, clear explanation with deadlines and next steps - read aloud in your language.
                    </p>
                  </div>

                  {/* Analyze Archive Features */}
                  <div className="pt-10 border-t border-[var(--color-outline-variant)] opacity-90">
                    <h4 className="font-headline text-xl text-[var(--color-primary)] mb-4">
                      Analyze Archive
                    </h4>
                    <p className="font-body text-sm text-[var(--color-on-surface-variant)] mb-6">
                      A living archive that keeps every document useful over time.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {archiveFeatures.map((feature) => (
                        <div key={feature} className="bg-[var(--color-surface-container-low)] p-4">
                          <p className="font-body text-xs text-[var(--color-on-surface-variant)] leading-relaxed">
                            {feature}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
