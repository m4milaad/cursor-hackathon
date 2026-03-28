'use client'

import { useEffect, useRef, useState } from 'react'

const CONFIG = {
  frameFolder: 'Raasta hero frames',
  filePrefix: 'img_',
  padDigits: 5,
  extension: '.jpg',
  totalFrames: 481,
  scrollHeightVH: 2, // Map to full sections defined by layout height
  interpolationAlpha: 0.85,
  easing: 'easeInOutQuad' as const,
}

function frameUrl(index1Based: number) {
  const name = `${CONFIG.filePrefix}${String(index1Based).padStart(CONFIG.padDigits, '0')}${CONFIG.extension}`
  // Use raw space string, let browser encode it
  return `/${CONFIG.frameFolder}/${name}`
}

function applyEasing(t: number, mode: 'easeInOutQuad' | 'linear') {
  const x = Math.min(1, Math.max(0, t))
  if (mode === 'easeInOutQuad') {
    return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2
  }
  return x
}

function drawImageCover(ctx: CanvasRenderingContext2D, image: HTMLImageElement, cw: number, ch: number) {
  if (!image || !image.naturalWidth) return
  const iw = image.naturalWidth
  const ih = image.naturalHeight
  const ir = iw / ih
  const cr = cw / ch
  let dw, dh, ox, oy
  if (ir > cr) {
    dh = ch
    dw = dh * ir
    ox = (cw - dw) / 2
    oy = 0
  } else {
    dw = cw
    dh = dw / ir
    ox = 0
    oy = (ch - dh) / 2
  }
  ctx.drawImage(image, ox, oy, dw, dh)
}

export function HeroScrollAnimation({ scrollContainerRef }: { scrollContainerRef: React.RefObject<HTMLDivElement | null> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imagesRef = useRef<HTMLImageElement[]>(new Array(CONFIG.totalFrames).fill(null))
  const requestRef = useRef<number>(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Safety fallback: Never trap the user for more than 4 seconds
    const fallbackTimer = setTimeout(() => {
      setLoading(false)
    }, 4000)

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return

    let needsDraw = false

    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = window.innerWidth
      const h = window.innerHeight
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      needsDraw = true
    }

    const loadImageForIndex = (zeroBased: number): Promise<HTMLImageElement | null> => {
      const i = zeroBased
      if (imagesRef.current[i] && imagesRef.current[i].complete && imagesRef.current[i].naturalWidth) {
        return Promise.resolve(imagesRef.current[i])
      }
      return new Promise((resolve) => {
        const img = new Image()
        img.decoding = 'async'
        img.onload = () => {
          imagesRef.current[i] = img
          resolve(img)
        }
        // Fault tolerant: resolve null instead of rejecting
        img.onerror = () => resolve(null)
        img.src = frameUrl(i + 1)
      })
    }

    const preloadAllFrames = async () => {
      const batch = 8
      const total = CONFIG.totalFrames
      for (let i = 0; i < total; i += batch) {
        const slice = []
        for (let j = i; j < Math.min(i + batch, total); j++) {
          slice.push(loadImageForIndex(j))
        }
        await Promise.all(slice)
      }
      setLoading(false)
      needsDraw = true
    }

    const scrollToFrameIndex = () => {
      if (!scrollContainerRef.current) return 0
      const container = scrollContainerRef.current
      const rect = container.getBoundingClientRect()
      
      // Calculate how far the container has scrolled top-to-bottom
      // When rect.top = 0, scroll is 0.
      // When rect.bottom = window.innerHeight, scroll is 1 (done scrolling past hero)
      const scrollDistance = Math.max(0, -rect.top)
      const maxScroll = Math.max(1, rect.height - window.innerHeight)
      const raw = Math.min(1, Math.max(0, scrollDistance / maxScroll))
      
      const eased = applyEasing(raw, CONFIG.easing)
      const last = CONFIG.totalFrames - 1
      return eased * last
    }

    let lastDrawnKey = -1

    const drawFrame = () => {
      const cw = window.innerWidth
      const ch = window.innerHeight
      const idx = scrollToFrameIndex()
      const i0 = Math.floor(idx)
      const i1 = Math.min(i0 + 1, CONFIG.totalFrames - 1)
      const frac = idx - i0

      const img0 = imagesRef.current[i0]
      const img1 = imagesRef.current[i1]

      const key = idx
      if (!needsDraw && Math.abs(key - lastDrawnKey) < 0.0001) {
        return
      }

      ctx.fillStyle = '#0a0a0a'
      ctx.fillRect(0, 0, cw, ch)

      if (!img0 || !img0.naturalWidth) return

      lastDrawnKey = key
      needsDraw = false

      const blend = CONFIG.interpolationAlpha * frac

      if (blend > 0.001 && img1 && img1.naturalWidth && i1 !== i0) {
        ctx.globalAlpha = 1
        drawImageCover(ctx, img0, cw, ch)
        ctx.globalAlpha = blend
        drawImageCover(ctx, img1, cw, ch)
        ctx.globalAlpha = 1
      } else {
        drawImageCover(ctx, img0, cw, ch)
      }
    }

    const onScroll = () => { needsDraw = true }
    
    const tick = () => {
      if (needsDraw) drawFrame()
      requestRef.current = requestAnimationFrame(tick)
    }

    window.addEventListener('resize', () => {
      resizeCanvas()
      needsDraw = true
    })
    
    window.addEventListener('scroll', onScroll, { passive: true })

    // Init
    resizeCanvas()
    requestRef.current = requestAnimationFrame(tick)
    preloadAllFrames().catch(console.error)

    return () => {
      clearTimeout(fallbackTimer)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', resizeCanvas)
      cancelAnimationFrame(requestRef.current)
    }
  }, [scrollContainerRef])

  return (
    <>
      {/* Black ambient background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover z-0 block "
        aria-hidden="true"
      />
      {/* Loading overlay for the canvas */}
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#0a0a0a]/90 backdrop-blur-md transition-opacity duration-1000">
          <div className="flex flex-col items-center gap-4">
            <span className="inline-block h-6 w-6 rounded-full border-t-2 border-[var(--color-primary-fixed-dim)] animate-spin"></span>
            <span className="font-label text-xs uppercase tracking-[0.3em] text-[var(--color-on-surface-variant)]">Loading Archival Footage...</span>
          </div>
        </div>
      )}
      {/* Frame Vignette Mask to blend with the rest of the page */}
      <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-t from-[var(--color-surface)] via-transparent to-transparent opacity-100 mb-[-2px]"></div>
    </>
  )
}
