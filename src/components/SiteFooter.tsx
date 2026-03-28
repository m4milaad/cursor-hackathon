import Link from 'next/link'

export function SiteFooter() {
  return (
    <footer className="bg-[#eae8e3] dark:bg-[#000d08] grid grid-cols-1 md:grid-cols-2 gap-8 w-full px-12 py-16 mt-auto border-t border-[#c1c8c3]/15 transition-colors duration-300">
      <div className="space-y-6">
        <div className="font-headline italic text-lg text-[#00271d] dark:text-[#fbf9f4]">RAASTA AI</div>
        <p className="font-label text-[10px] uppercase tracking-[0.2em] text-[#00271d] dark:text-[#fbf9f4] opacity-80">
          © {new Date().getFullYear()} RAASTA AI. ARCHIVING THE FUTURE OF KASHMIR.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col space-y-3">
          <Link href="#" className="font-label text-[10px] uppercase tracking-[0.2em] text-[#00271d] dark:text-[#eae8e3] opacity-60 hover:opacity-100 transition-opacity">
            Heritage Protocol
          </Link>
          <Link href="#" className="font-label text-[10px] uppercase tracking-[0.2em] text-[#00271d] dark:text-[#eae8e3] opacity-60 hover:opacity-100 transition-opacity">
            Privacy Folio
          </Link>
        </div>
        <div className="flex flex-col space-y-3">
          <Link href="#" className="font-label text-[10px] uppercase tracking-[0.2em] text-[#00271d] dark:text-[#eae8e3] opacity-60 hover:opacity-100 transition-opacity">
            Agricultural Terms
          </Link>
          <Link href="#" className="font-label text-[10px] uppercase tracking-[0.2em] text-[#00271d] dark:text-[#eae8e3] opacity-60 hover:opacity-100 transition-opacity">
            Contact Archivist
          </Link>
        </div>
      </div>
    </footer>
  )
}
