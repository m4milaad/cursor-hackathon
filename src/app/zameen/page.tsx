'use client'

import { analyzeCropImage } from '@/lib/vision'
import { explainCropAdvice } from '@/lib/llm'
import { useI18n } from '@/lib/i18n/context'
import { speakForLocale, stopSpeaking } from '@/lib/tts'
import { useCallback, useRef, useState } from 'react'

export default function ZameenPage() {
  const { locale } = useI18n()
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [mandiInfo, setMandiInfo] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      setImagePreview(URL.createObjectURL(file))
      setResult(null)
      setMandiInfo(null)
    }
  }, [])

  const handleAnalyze = useCallback(async () => {
    if (!selectedImage) return
    
    setAnalyzing(true)
    setResult(null)
    stopSpeaking()
    
    try {
      // Step 1: Analyze the image using vision API
      const analysis = await analyzeCropImage(selectedImage)
      setMandiInfo(analysis.mandiHint)
      
      // Step 2: Get detailed advice from LLM
      const advice = await explainCropAdvice(analysis.summary, analysis.mandiHint, locale)
      setResult(advice)
      
      // Step 3: Speak the result
      await speakForLocale(advice, locale)
    } catch (error) {
      console.error('Analysis error:', error)
      setResult('Unable to analyze image. Please try again.')
    } finally {
      setAnalyzing(false)
    }
  }, [selectedImage, locale])

  const triggerFileSelect = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  return (
    <main className="leaf-pattern flex-grow pt-24 min-h-screen">
      {/* Hero Section */}
      <section className="px-8 md:px-24 py-16 md:py-24 grid grid-cols-1 md:grid-cols-12 gap-12 items-end">
        <div className="md:col-span-8">
          <p className="font-label text-[10px] uppercase tracking-[0.2em] text-[var(--color-secondary)] mb-4">
            Agricultural Intelligence
          </p>
          <h1 className="font-headline text-5xl md:text-7xl font-bold tracking-tight text-[var(--color-primary)] leading-[1.1]">
            Zameen — <br />
            <span className="italic font-normal">Your Land, Your Livelihood.</span>
          </h1>
        </div>
        <div className="md:col-span-4 border-l border-[var(--color-outline-variant)] opacity-90 pl-8 hidden md:block">
          <p className="text-[var(--color-on-surface-variant)] leading-relaxed text-sm">
            Harnessing Kashmiri heritage and predictive AI to safeguard our fields. From Mandi fluctuations to soil vitality, we archive the future of your harvest.
          </p>
        </div>
      </section>

      {/* Main Content Canvas */}
      <section className="px-8 md:px-24 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Analyze Crop Column */}
          <div className="lg:col-span-7 flex flex-col gap-8">
            {/* Image Showcase / Preview */}
            <div className="relative h-[400px] overflow-hidden grayscale hover:grayscale-0 transition-all duration-700">
              {imagePreview ? (
                <img
                  alt="Selected crop image"
                  className="w-full h-full object-cover"
                  src={imagePreview}
                />
              ) : (
                <img
                  alt="Kashmiri wheat fields"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCC6X08VKCuZvJlFsbKKEDXFoxRw0wJylMybFVS7evqgGCOmQIJOVg6dfHviiUJINi24ThueGX_n6N3e-hijDuDFndN0qWXCBQM-4AzHAdj7_eEYxwpaGUb9b1WislmEZaOcELh0qnnd8ZFZGtmfNhGSTloY91n2HEXGI-eiRpVsRgp1JVqwAcxg_6i4UbXcFuDHazckiePOnYw7ut5RTPxD_b1Ifkc26_iejCdqut944fV7itDFfa8bjHeMHqIkcxkvFtoiFAMy8Y"
                />
              )}
              <div className="absolute bottom-0 left-0 bg-[var(--color-primary)] p-6 text-[var(--color-on-primary)]">
                <p className="font-headline italic text-lg tracking-tight">
                  {imagePreview ? 'Your Crop Image' : 'The Archival Gaze: Wheat Strains 2024'}
                </p>
              </div>
            </div>

            {/* Analyze Crop Module */}
            <div className="bg-[var(--color-surface-container-low)] p-10 border-t-4 border-[var(--color-primary)]">
              <p className="font-label text-[10px] uppercase tracking-[0.2em] text-[var(--color-secondary)] mb-6">
                Diagnostic Module
              </p>
              <h2 className="font-headline text-3xl mb-8">Analyze Crop</h2>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              <div 
                onClick={triggerFileSelect}
                className="border-2 border-dashed border-[var(--color-outline-variant)] p-12 flex flex-col items-center justify-center text-center hover:bg-[var(--color-surface-container-lowest)] transition-colors cursor-pointer group"
              >
                <span className="material-symbols-outlined text-4xl text-[var(--color-outline)] mb-4 group-hover:text-[var(--color-secondary)] transition-colors">
                  upload_file
                </span>
                <p className="font-body text-sm text-[var(--color-on-surface-variant)] max-w-xs mx-auto">
                  {selectedImage 
                    ? `Selected: ${selectedImage.name}` 
                    : 'Drop your harvest imagery here for AI-driven disease detection and soil nutrient mapping.'}
                </p>
                <button 
                  type="button"
                  className="mt-8 bg-[var(--color-primary)] text-[var(--color-on-primary)] px-8 py-3 font-label text-[10px] uppercase tracking-widest hover:bg-[var(--color-secondary)] transition-colors"
                >
                  Select Archive File
                </button>
              </div>
              
              {selectedImage && (
                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  className={`w-full mt-6 bg-[var(--color-secondary)] text-[var(--color-on-secondary)] py-4 font-label text-[10px] uppercase tracking-[0.2em] transition-all ${analyzing ? 'opacity-50' : 'hover:bg-opacity-90'}`}
                >
                  {analyzing ? 'Analyzing...' : 'Analyze Crop Image'}
                </button>
              )}
            </div>

            {/* Analysis Result */}
            {result && (
              <div className="bg-[var(--color-surface-container-high)] p-8 border-l-4 border-[var(--color-secondary)]">
                <p className="font-label text-[10px] uppercase tracking-[0.2em] text-[var(--color-secondary)] mb-4">
                  AI Analysis Result
                </p>
                <div className="font-body text-base text-[var(--color-on-surface)] leading-relaxed whitespace-pre-wrap">
                  {result}
                </div>
                {mandiInfo && (
                  <div className="mt-6 pt-4 border-t border-[var(--color-outline-variant)]">
                    <p className="font-label text-[10px] uppercase tracking-widest text-[var(--color-on-surface-variant)]">
                      Market Info: {mandiInfo}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Live Mandi Column */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            {/* Mandi Card */}
            <div className="bg-[var(--color-primary-container)] p-8 text-[var(--color-on-primary)] min-h-[500px] relative">
              <div className="absolute left-0 top-8 bottom-8 w-1 bg-[var(--color-secondary)]"></div>
              <div className="flex justify-between items-start mb-12">
                <div>
                  <p className="font-label text-[10px] uppercase tracking-[0.2em] text-[var(--color-secondary-container)] mb-2">
                    Market Pulse
                  </p>
                  <h2 className="font-headline text-3xl">Live Mandi Prices</h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-[var(--color-secondary)] rounded-full animate-pulse"></span>
                  <span className="font-label text-[10px] uppercase tracking-widest text-[var(--color-secondary-container)]">
                    Real-time
                  </span>
                </div>
              </div>

              <div className="space-y-12">
                {/* Price Item 1 */}
                <div className="border-b border-opacity-20 border-[var(--color-on-primary-fixed-variant)] pb-4">
                  <div className="flex justify-between items-end mb-2">
                    <span className="font-headline text-xl italic">Saffron (Grade A)</span>
                    <span className="font-body text-2xl font-bold text-[var(--color-secondary)]">Rs.245,000 / kg</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-label uppercase tracking-widest opacity-60">
                    <span>Pampore Hub</span>
                    <span className="text-[var(--color-secondary-fixed-dim)]">+2.4% </span>
                  </div>
                </div>
                
                {/* Price Item 2 */}
                <div className="border-b border-opacity-20 border-[var(--color-on-primary-fixed-variant)] pb-4">
                  <div className="flex justify-between items-end mb-2">
                    <span className="font-headline text-xl italic">Walnuts (Shelled)</span>
                    <span className="font-body text-2xl font-bold text-[var(--color-secondary)]">Rs.850 / kg</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-label uppercase tracking-widest opacity-60">
                    <span>Srinagar Central</span>
                    <span className="text-[var(--color-error)]">-0.8% </span>
                  </div>
                </div>

                {/* Price Item 3 */}
                <div className="border-b border-opacity-20 border-[var(--color-on-primary-fixed-variant)] pb-4">
                  <div className="flex justify-between items-end mb-2">
                    <span className="font-headline text-xl italic">Apples (Kullu)</span>
                    <span className="font-body text-2xl font-bold text-[var(--color-secondary)]">Rs.1,200 / box</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-label uppercase tracking-widest opacity-60">
                    <span>Sopore Mandi</span>
                    <span className="text-[var(--color-secondary-fixed-dim)]">+5.1% </span>
                  </div>
                </div>
              </div>

              <button className="w-full mt-12 bg-[var(--color-secondary)] text-[var(--color-on-secondary)] py-4 font-label text-[10px] uppercase tracking-[0.2em] hover:bg-opacity-90 transition-all">
                View Historical Trends
              </button>
            </div>

            {/* Heritage Insight Card */}
            <div className="bg-[var(--color-surface-container-high)] p-8 border-l-4 border-[var(--color-secondary)]">
              <p className="font-label text-[10px] uppercase tracking-[0.2em] text-[var(--color-secondary)] mb-4">
                Historical Precedent
              </p>
              <h3 className="font-headline text-xl mb-4 italic text-[var(--color-primary)]">
                &quot;The land is a trust from the ancestors, given to us for the benefit of the progeny.&quot;
              </h3>
              <p className="text-sm text-[var(--color-on-surface-variant)] leading-relaxed">
                Traditional soil-resting methods from the Jhelum valley show a 15% higher resilience against modern frost patterns. AI suggests integrating &apos;Karewa&apos; terrace strategies this season.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Aesthetic Divider Image */}
      <section className="px-8 md:px-24 mb-24">
        <div className="h-[200px] w-full grayscale opacity-40 hover:opacity-100 hover:grayscale-0 transition-all duration-1000">
          <img
            alt="Saffron flower close up"
            className="w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDiVvmpbw8UCLP-zSw4dK_-shqD-44Wm2xmzMtCrHiNgmAJAjnv1Hshmf7YZBdHa-2R9J5Aox2tol6yJZtdaCf8kOP7V2P-E8RYvtn_KFOZ5nriLh8bVCoosZ79od2URelCG-GAYGxpMyww_JPtth0Xyx6a8Yas8PUZZ0xtwVi_lvq2I-GJp0PZaeF008FY1haiyYZnRAcy5TpF_fnMEEWcq7Kg0rcFBWmTo_0skhp1S2Oygjpe2W03wftYHt7bNe09ke9J4WQwwiM"
          />
        </div>
      </section>
    </main>
  )
}
