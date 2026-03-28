export default function SamjhoPage() {
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
            <div className="aspect-[3/4] bg-[var(--color-surface-container-low)] flex flex-col items-center justify-center p-8 text-center transition-colors duration-300 group-hover:bg-[var(--color-surface-container)]">
              {/* Decorative Frame Corner (Custom Editorial Touch) */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[var(--color-primary)] opacity-20"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[var(--color-primary)] opacity-20"></div>
              
              <span className="material-symbols-outlined text-4xl text-[var(--color-outline)] mb-6" style={{ fontVariationSettings: "'FILL' 0" }}>
                upload_file
              </span>
              <h3 className="font-headline text-2xl mb-2 text-[var(--color-primary)]">Upload or take a photo</h3>
              <p className="font-label text-xs uppercase tracking-widest text-[var(--color-on-surface-variant)] mb-8 px-4">
                Support for Urdu, Kashmiri, and English texts
              </p>
              
              <button className="bg-[var(--color-primary-container)] text-[var(--color-on-primary)] px-10 py-4 font-label text-[10px] uppercase tracking-[0.2em] hover:bg-[var(--color-primary)] transition-colors">
                Select Document
              </button>
            </div>
          </div>

          {/* Complexity Meter Section */}
          <div className="bg-[var(--color-surface-container-high)] p-8">
            <span className="font-label text-[10px] uppercase tracking-[0.2em] text-[var(--color-secondary)] mb-6 block">
              Document Metrics
            </span>
            <div className="flex items-end justify-between mb-2">
              <span className="font-headline text-3xl text-[var(--color-primary)]">High</span>
              <span className="font-label text-[10px] uppercase tracking-widest text-[var(--color-on-surface-variant)]">
                Complexity Score
              </span>
            </div>
            <div className="w-full h-px bg-[var(--color-outline-variant)] opacity-30 mb-8"></div>
            <p className="font-body text-sm text-[var(--color-on-surface-variant)] leading-relaxed">
              The current document contains dense archaic agricultural terminology requiring contextual cross-referencing.
            </p>
          </div>

          {/* Primary Action */}
          <button className="w-full bg-[var(--color-primary-container)] text-[var(--color-on-primary)] py-6 flex items-center justify-center space-x-4 group hover:bg-[var(--color-primary)] transition-colors">
            <span className="font-label text-xs uppercase tracking-[0.3em]">Analyze Archive</span>
            <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">
              arrow_forward
            </span>
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
                <span>Process ID: 8821-KM</span>
                <span>•</span>
                <span>Confidence: 94.2%</span>
              </div>
            </div>

            {/* AI-Generated Content Blocks */}
            <div className="space-y-12">
              
              {/* Heritage Insight Card Pattern */}
              <div className="relative pl-8 py-2">
                <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[var(--color-secondary)]"></div>
                <h4 className="font-headline text-2xl text-[var(--color-primary)] mb-4 italic">Historical Context</h4>
                <p className="font-body text-base text-[var(--color-on-surface-variant)] leading-relaxed">
                  The document refers to <span className="text-[var(--color-primary)] font-semibold">&quot;Saffron Guild Allotments&quot;</span> dated during the late Dogra period. The terminology used suggests a formalized land grant system previously thought to be informal in the South Kashmir region.
                </p>
              </div>

              {/* Key Takeaways: Bento-style detail grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[var(--color-surface-container-low)] p-6">
                  <span className="material-symbols-outlined text-[var(--color-secondary)] mb-4">history_edu</span>
                  <h5 className="font-headline text-lg text-[var(--color-primary)] mb-2">Legal Status</h5>
                  <p className="font-body text-xs text-[var(--color-on-surface-variant)]">
                    Document confirms ancestral rights to 4 kanals of premium soil in the Pampore plateau.
                  </p>
                </div>
                <div className="bg-[var(--color-surface-container-low)] p-6">
                  <span className="material-symbols-outlined text-[var(--color-secondary)] mb-4">grass</span>
                  <h5 className="font-headline text-lg text-[var(--color-primary)] mb-2">Soil Quality</h5>
                  <p className="font-body text-xs text-[var(--color-on-surface-variant)]">
                    Mentions &apos;Gureti&apos; soil, historically optimal for high-yield Crocus Sativus cultivation.
                  </p>
                </div>
              </div>

              {/* Main Body Copy */}
              <div className="max-w-none">
                <h4 className="font-headline text-xl text-[var(--color-primary)] mb-4">Full Extraction Summary</h4>
                <p className="font-body text-sm text-[var(--color-on-surface-variant)] leading-relaxed mb-6">
                  Preliminary analysis indicates a deed of transfer involving three parties. The script appears to be a fusion of Persian-influenced court Urdu and traditional Sharda markings. Our AI model suggests that the primary intent was the resolution of a water-sharing dispute between adjacent saffron farms.
                </p>
                <p className="font-body text-sm text-[var(--color-on-surface-variant)] leading-relaxed">
                  Key mentions include the name of the &apos;Zaildar&apos; and specific coordinates relative to the Jhelum tributaries. For a full legal translation, we recommend proceeding with the <span className="text-[var(--color-secondary)] underline underline-offset-4 decoration-[var(--color-secondary)]/30">Heritage Protocol</span> module.
                </p>
              </div>

              {/* Suggested Chips */}
              <div className="pt-8 border-t border-[var(--color-outline-variant)] opacity-80 mt-12">
                <span className="font-label text-[10px] uppercase tracking-widest text-[var(--color-on-surface-variant)] mb-4 block">
                  Refinement Suggestions
                </span>
                <div className="flex flex-wrap gap-3">
                  <span className="bg-[var(--color-surface-container-low)] px-4 py-2 font-label text-[10px] uppercase tracking-widest text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container-highest)] cursor-pointer transition-colors">
                    Compare with 1947 Registry
                  </span>
                  <span className="bg-[var(--color-surface-container-low)] px-4 py-2 font-label text-[10px] uppercase tracking-widest text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container-highest)] cursor-pointer transition-colors">
                    Translate to Kashmiri
                  </span>
                  <span className="bg-[var(--color-surface-container-low)] px-4 py-2 font-label text-[10px] uppercase tracking-widest text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container-highest)] cursor-pointer transition-colors">
                    Export as Heritage PDF
                  </span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
