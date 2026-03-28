'use client'

import {
  heroFrameUrl,
  HERO_TOTAL_FRAMES,
} from '@/lib/heroFrameConfig'
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'

const INTERPOLATION_ALPHA = 0.85
const EASING: 'linear' | 'easeInOutQuad' = 'easeInOutQuad'
const PRELOAD_BATCH = 8

function applyEasing(t: number, mode: typeof EASING): number {
  const x = Math.min(1, Math.max(0, t))
  if (mode === 'easeInOutQuad') {
    return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2
  }
  return x
}

function drawImageCover(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  cw: number,
  ch: number,
) {
  if (!image.naturalWidth) return
  const iw = image.naturalWidth
  const ih = image.naturalHeight
  const ir = iw / ih
  const cr = cw / ch
  let dw: number
  let dh: number
  let ox: number
  let oy: number
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

function loadFrame(
  images: (HTMLImageElement | null)[],
  zeroBased: number,
): Promise<HTMLImageElement> {
  const existing = images[zeroBased]
  if (existing?.complete && existing.naturalWidth) {
    return Promise.resolve(existing)
  }
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.decoding = 'async'
    img.onload = () => {
      images[zeroBased] = img
      resolve(img)
    }
    img.onerror = () =>
      reject(new Error(`Hero frame failed: ${heroFrameUrl(zeroBased + 1)}`))
    img.src = heroFrameUrl(zeroBased + 1)
  })
}

async function preloadFrames(
  images: (HTMLImageElement | null)[],
  startIndex: number,
  endIndex: number,
  onProgress?: (loaded: number, total: number) => void,
): Promise<void> {
  const total = endIndex - startIndex;
  let loadedCount = 0;
  for (let i = startIndex; i < endIndex; i += PRELOAD_BATCH) {
    const batch: Promise<HTMLImageElement>[] = []
    for (let j = i; j < Math.min(i + PRELOAD_BATCH, endIndex); j++) {
      batch.push(loadFrame(images, j))
    }
    await Promise.all(batch)
    loadedCount += batch.length;
    if (onProgress) onProgress(loadedCount, total)
  }
}

type Props = {
  /** Extra scroll distance (× viewport height) to scrub the full frame range */
  scrollHeightVH?: number
  children?: ReactNode
  className?: string
  /** Dev-only frame counter (or set NEXT_PUBLIC_HERO_FRAMES_DEBUG=1) */
  debug?: boolean
}

/**
 * Sticky full-viewport hero: canvas draws frame sequence from scroll progress
 * through this section only. Children sit above the canvas (titles, CTAs).
 */
export function HeroScrollFrames({
  scrollHeightVH = 3.75,
  children,
  className = '',
  debug: debugProp,
}: Props) {
  const sectionRef = useRef<HTMLElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imagesRef = useRef<(HTMLImageElement | null)[]>(
    Array.from({ length: HERO_TOTAL_FRAMES }, () => null),
  )
  const needsDrawRef = useRef(true)
  const lastIdxRef = useRef(-1)
  const rafRef = useRef<number>(0)
  const [ready, setReady] = useState(false)
  const [loadPct, setLoadPct] = useState(0)
  const [err, setErr] = useState<string | null>(null)

  const debug =
    debugProp ??
    (typeof process !== 'undefined' &&
      process.env.NEXT_PUBLIC_HERO_FRAMES_DEBUG === '1')

  const scrollProgress = useCallback((): number => {
    const el = sectionRef.current
    if (!el) return 0
    const sectionTop = el.getBoundingClientRect().top + window.scrollY
    const sectionHeight = el.offsetHeight
    const vh = window.innerHeight
    const maxScroll = Math.max(1, sectionHeight - vh)
    const p = (window.scrollY - sectionTop) / maxScroll
    return Math.min(1, Math.max(0, p))
  }, [])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d', { alpha: false })
    if (!canvas || !ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const cw = window.innerWidth
    const ch = window.innerHeight

    const progress = applyEasing(scrollProgress(), EASING)
    const idx = progress * (HERO_TOTAL_FRAMES - 1)
    const i0 = Math.floor(idx)
    const i1 = Math.min(i0 + 1, HERO_TOTAL_FRAMES - 1)
    const frac = idx - i0

    if (
      !needsDrawRef.current &&
      Math.abs(idx - lastIdxRef.current) < 0.0001 &&
      !debug
    ) {
      return
    }

    const images = imagesRef.current
    const img0 = images[i0]
    const img1 = images[i1]

    ctx.fillStyle = '#0c0f0e'
    ctx.fillRect(0, 0, cw, ch)

    if (!img0?.naturalWidth) {
      return
    }

    lastIdxRef.current = idx
    needsDrawRef.current = false

    const blend = INTERPOLATION_ALPHA * frac
    if (blend > 0.001 && img1?.naturalWidth && i1 !== i0) {
      ctx.globalAlpha = 1
      drawImageCover(ctx, img0, cw, ch)
      ctx.globalAlpha = blend
      drawImageCover(ctx, img1, cw, ch)
      ctx.globalAlpha = 1
    } else {
      drawImageCover(ctx, img0, cw, ch)
    }

    if (debug && process.env.NODE_ENV !== 'production') {
      ctx.save()
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.scale(dpr, dpr)
      ctx.fillStyle = 'rgba(0,0,0,0.55)'
      ctx.fillRect(8, ch - 72, 200, 64)
      ctx.fillStyle = '#e5e5e5'
      ctx.font = '11px ui-monospace, monospace'
      ctx.textAlign = 'left'
      ctx.fillText(`frame: ${idx.toFixed(2)}`, 16, ch - 48)
      ctx.fillText(`${i0} → ${i1}  α ${blend.toFixed(2)}`, 16, ch - 30)
      ctx.restore()
    }
  }, [debug, scrollProgress])

  const scheduleDraw = useCallback(() => {
    needsDrawRef.current = true
    if (rafRef.current) return
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0
      draw()
    })
  }, [draw])

  useEffect(() => {
    if (!canvasRef.current?.getContext('2d', { alpha: false })) return

    function resize() {
      const el = canvasRef.current
      const c = el?.getContext('2d', { alpha: false })
      if (!el || !c) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = window.innerWidth
      const h = window.innerHeight
      el.style.width = `${w}px`
      el.style.height = `${h}px`
      el.width = Math.floor(w * dpr)
      el.height = Math.floor(h * dpr)
      c.setTransform(dpr, 0, 0, dpr, 0, 0)
      needsDrawRef.current = true
      scheduleDraw()
    }

    resize()
    window.addEventListener('resize', resize, { passive: true })
    window.addEventListener('scroll', scheduleDraw, { passive: true })

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('scroll', scheduleDraw)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [scheduleDraw])

  useEffect(() => {
    const images = imagesRef.current
    const initialLoadCount = Math.min(20, HERO_TOTAL_FRAMES)

    void preloadFrames(images, 0, initialLoadCount, (loaded, total) => {
      setLoadPct(Math.round((100 * loaded) / total))
    })
      .then(() => {
        setReady(true)
        needsDrawRef.current = true
        scheduleDraw()

        // Lazily load remaining frames in background
        if (initialLoadCount < HERO_TOTAL_FRAMES) {
          preloadFrames(images, initialLoadCount, HERO_TOTAL_FRAMES).catch(console.error)
        }
      })
      .catch((e: unknown) => {
        console.error(e)
        setErr('Could not load hero frames')
      })
  }, [scheduleDraw])

  const sectionStyle = { height: `${scrollHeightVH * 100}vh` } as const

  return (
    <section
      ref={sectionRef}
      className={`relative w-full ${className}`.trim()}
      style={sectionStyle}
      aria-label="Hero"
    >
      <div className="sticky top-0 h-svh min-h-svh w-full overflow-hidden">
        <canvas
          ref={canvasRef}
          className="pointer-events-none absolute inset-0 z-0 block h-full w-full"
          aria-hidden
        />

        {/* Readability over photography */}
        <div
          className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-[#0a0f0d]/70 via-[#0a0f0d]/35 to-[#0a0f0d]/55"
          aria-hidden
        />

        {!ready && !err ? (
          <div
            className="absolute inset-0 z-[2] flex flex-col items-center justify-end gap-2 pb-24 text-center text-sm text-white/80"
            role="status"
            aria-live="polite"
          >
            <span className="rounded-full bg-black/35 px-3 py-1 text-xs backdrop-blur-sm">
              Loading hero… {loadPct}%
            </span>
          </div>
        ) : null}

        {err ? (
          <div className="absolute inset-0 z-[2] flex items-center justify-center bg-[var(--color-surface-container)] px-4 text-center text-sm text-[var(--color-on-surface-variant)]">
            {err}
          </div>
        ) : null}

        {children ? (
          <div className="relative z-[3] flex h-full min-h-svh flex-col">{children}</div>
        ) : null}
      </div>
    </section>
  )
}
