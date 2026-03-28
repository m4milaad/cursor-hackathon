'use client'

import { useEffect, useRef, useState } from 'react'

const CONFIG = {
  frameFolder: 'hero-frames-optimized',
  filePrefix: 'img_',
  padDigits: 5,
  extension: '.webp',
  totalFrames: 241,
  scrollHeightVH: 2,
  interpolationAlpha: 0.85,
  easing: 'easeInOutQuad' as const,
}

const FIRST_FRAME_SRC = `/${CONFIG.frameFolder}/${CONFIG.filePrefix}${'1'.padStart(CONFIG.padDigits, '0')}${CONFIG.extension}`

function frameUrl(index1Based: number) {
  const name = `${CONFIG.filePrefix}${String(index1Based).padStart(CONFIG.padDigits, '0')}${CONFIG.extension}`
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
  const [canvasReady, setCanvasReady] = useState(false)

  useEffect(() => {
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
        img.onerror = () => resolve(null)
        img.src = frameUrl(i + 1)
      })
    }

    const preloadAllFrames = async () => {
      const batch = 12
      const total = CONFIG.totalFrames
      for (let i = 0; i < total; i += batch) {
        const slice = []
        for (let j = i; j < Math.min(i + batch, total); j++) {
          slice.push(loadImageForIndex(j))
        }
        await Promise.all(slice)
        // After the first batch lands, the canvas can take over from the static <img>
        if (i === 0) {
          needsDraw = true
          drawFrame()
          setCanvasReady(true)
        }
      }
      needsDraw = true
    }

    const scrollToFrameIndex = () => {
      if (!scrollContainerRef.current) return 0
      const container = scrollContainerRef.current
      const rect = container.getBoundingClientRect()
      const scrollDistance = Math.max(0, -rect.top)
      const maxScroll = Math.max(1, rect.height - window.innerHeight)
      const raw = Math.min(1, Math.max(0, scrollDistance / maxScroll))
      const eased = applyEasing(raw, CONFIG.easing)
      return eased * (CONFIG.totalFrames - 1)
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

      if (!img0 || !img0.naturalWidth) {
        // Fall through — static <img> is visible underneath
        return
      }

      ctx.fillStyle = '#0a0a0a'
      ctx.fillRect(0, 0, cw, ch)

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

    const onResize = () => {
      resizeCanvas()
      needsDraw = true
    }

    window.addEventListener('resize', onResize)
    window.addEventListener('scroll', onScroll, { passive: true })

    resizeCanvas()
    requestRef.current = requestAnimationFrame(tick)
    preloadAllFrames().catch(console.error)

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      cancelAnimationFrame(requestRef.current)
    }
  }, [scrollContainerRef])

  return (
    <>
      {/* Static first frame — visible instantly before any JS runs, acts as poster */}
      <img
        src={FIRST_FRAME_SRC}
        alt=""
        aria-hidden="true"
        fetchPriority="high"
        className={`absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-500 ${canvasReady ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      />
      {/* Canvas paints over the static image once frames are loaded */}
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 w-full h-full object-cover z-[1] block transition-opacity duration-500 ${canvasReady ? 'opacity-100' : 'opacity-0'}`}
        aria-hidden="true"
      />
      {/* Vignette gradient for page blending */}
      <div className="absolute inset-0 z-[2] pointer-events-none bg-gradient-to-t from-[var(--color-surface)] via-transparent to-transparent opacity-100 mb-[-2px]"></div>
    </>
  )
}
