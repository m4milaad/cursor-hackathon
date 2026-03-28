/** Static assets in `public/hero-frames-optimized/` */
export const HERO_FRAME_FOLDER = 'hero-frames-optimized'
export const HERO_FRAME_PREFIX = 'img_'
export const HERO_FRAME_PAD = 5
export const HERO_FRAME_EXT = '.webp'
export const HERO_TOTAL_FRAMES = 241

export function heroFrameUrl(index1Based: number): string {
  const name = `${HERO_FRAME_PREFIX}${String(index1Based).padStart(HERO_FRAME_PAD, '0')}${HERO_FRAME_EXT}`
  const folder = HERO_FRAME_FOLDER.split('/')
    .map(encodeURIComponent)
    .join('/')
  return `/${folder}/${encodeURIComponent(name)}`
}
