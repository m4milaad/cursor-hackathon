import { HomeHero } from '@/components/HomeHero'
import Link from 'next/link'

export default function Page() {
  return (
    <main className="flex-grow w-full bg-[#fbf9f4]">
      {/* Scroll-Animation Integrated Hero Section */}
      <HomeHero />

      {/* ModeCards Grid */}
      <section className="max-w-7xl mx-auto px-8 md:px-12 mb-20 relative z-30 pt-16 bg-[#fbf9f4]">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-0 border border-[var(--color-outline-variant)] opacity-85">
          {/* Samjho */}
          <Link
            href="/samjho"
            className="group p-8 md:border-r border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] hover:bg-[var(--color-surface-container-lowest)] transition-colors duration-500 cursor-pointer block"
          >
            <span className="font-label text-[10px] uppercase tracking-widest text-[var(--color-secondary)] block mb-6">
              Archive 01
            </span>
            <span className="material-symbols-outlined text-[var(--color-primary-container)] mb-4 text-3xl">
              menu_book
            </span>
            <h3 className="font-headline text-2xl font-bold text-[var(--color-primary-container)] mb-2">
              Samjho
            </h3>
            <p className="font-body text-sm text-[var(--color-on-surface-variant)] leading-relaxed opacity-80">
              Translate ancient manuscripts and preserve regional linguistics through neural archiving.
            </p>
          </Link>

          {/* Zameen */}
          <Link
            href="/zameen"
            className="group p-8 md:border-r border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] hover:bg-[var(--color-surface-container-lowest)] transition-colors duration-500 cursor-pointer block"
          >
            <span className="font-label text-[10px] uppercase tracking-widest text-[var(--color-secondary)] block mb-6">
              Archive 02
            </span>
            <span className="material-symbols-outlined text-[var(--color-primary-container)] mb-4 text-3xl">
              potted_plant
            </span>
            <h3 className="font-headline text-2xl font-bold text-[var(--color-primary-container)] mb-2">
              Zameen
            </h3>
            <p className="font-body text-sm text-[var(--color-on-surface-variant)] leading-relaxed opacity-80">
              Agricultural intelligence tailored to the Valley&apos;s soil, climate, and heirloom crops.
            </p>
          </Link>

          {/* Taleem */}
          <Link
            href="/taleem"
            className="group p-8 md:border-r border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] hover:bg-[var(--color-surface-container-lowest)] transition-colors duration-500 cursor-pointer block"
          >
            <span className="font-label text-[10px] uppercase tracking-widest text-[var(--color-secondary)] block mb-6">
              Archive 03
            </span>
            <span className="material-symbols-outlined text-[var(--color-primary-container)] mb-4 text-3xl">
              school
            </span>
            <h3 className="font-headline text-2xl font-bold text-[var(--color-primary-container)] mb-2">
              Taleem
            </h3>
            <p className="font-body text-sm text-[var(--color-on-surface-variant)] leading-relaxed opacity-80">
              Localized education modules bridging traditional knowledge with modern technology.
            </p>
          </Link>

          {/* Raah */}
          <Link
            href="/raah"
            className="group p-8 bg-[var(--color-surface-container-low)] hover:bg-[var(--color-surface-container-lowest)] transition-colors duration-500 cursor-pointer block"
          >
            <span className="font-label text-[10px] uppercase tracking-widest text-[var(--color-secondary)] block mb-6">
              Archive 04
            </span>
            <span className="material-symbols-outlined text-[var(--color-primary-container)] mb-4 text-3xl">
              explore
            </span>
            <h3 className="font-headline text-2xl font-bold text-[var(--color-primary-container)] mb-2">
              Raah
            </h3>
            <p className="font-body text-sm text-[var(--color-on-surface-variant)] leading-relaxed opacity-80">
              Navigate the cultural landscape with AI-curated journeys through heritage sites.
            </p>
          </Link>
        </div>
      </section>

      {/* Featured Update Section */}
      <section className="max-w-7xl mx-auto px-8 md:px-12 relative z-30 pb-20">
        <div className="flex flex-col md:flex-row bg-[var(--color-primary-container)] text-[var(--color-on-primary)] shadow-xl">
          <div className="w-full md:w-1/2 overflow-hidden">
            <img
              className="w-full h-[400px] md:h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
              alt="dramatic panoramic view of Dal Lake at dawn"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCc-6uXiMRpBM2pM4Bnc7YSEvWAnti125fVd7nFfiBm6aQyiXLSVr-eHe-xn8nn-lLTWPr4Jq-HijmU7qGi2Gzlu6tqpktZgeurtRm1XMLUFHtXTUjUloDptJ_Q-BnKeQTpPDg4GntvIarQ7MJgPzOzuVkUq7J8k5EtALAhSU2OGwfoKpwNZ6ZDTlONmXDBzAmTyIGfrrpQjRLbf8fmpDPu0AjSqbbscfJ5Lqe_2Bsxg4VjwG3iv5yVzITYzdyH4rSz9VTiS9SewrQ"
            />
          </div>
          <div className="w-full md:w-1/2 p-12 md:p-20 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-6">
              <div className="h-[2px] w-8 bg-[var(--color-secondary)]"></div>
              <span className="font-label text-[10px] uppercase tracking-[0.2em] text-[var(--color-on-primary-container)]">
                Dispatch: Winter 2024
              </span>
            </div>
            <h2 className="font-headline text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Preserving the Silence of the Valley
            </h2>
            <p className="font-body text-lg opacity-80 mb-10 leading-relaxed italic">
              Our latest AI update introduces advanced topographic mapping for traditional water management systems in high-altitude wetlands.
            </p>
            <div>
              <button className="bg-[var(--color-secondary)] text-[var(--color-on-secondary)] px-8 py-4 font-label text-xs uppercase tracking-widest hover:opacity-90 transition-opacity">
                Read the Protocol
              </button>
            </div>
          </div>
        </div>
      </section>

    </main>
  )
}
