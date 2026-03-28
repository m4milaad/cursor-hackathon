/** Static assets in `public/Raasta hero frames/` */
export const HERO_FRAME_FOLDER = 'Raasta hero frames'
export const HERO_FRAME_PREFIX = 'img_'
export const HERO_FRAME_PAD = 5
export const HERO_FRAME_EXT = '.jpg'
export const HERO_TOTAL_FRAMES = 481

export function heroFrameUrl(index1Based: number): string {
  const name = `${HERO_FRAME_PREFIX}${String(index1Based).padStart(HERO_FRAME_PAD, '0')}${HERO_FRAME_EXT}`
  const folder = HERO_FRAME_FOLDER.split('/')
    .map(encodeURIComponent)
    .join('/')
  return `/${folder}/${encodeURIComponent(name)}`
}
