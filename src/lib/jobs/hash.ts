import { createHash } from 'crypto'

/**
 * Normalize apply URL and hash for deduplication across scrape runs.
 */
export function hashApplyLink(url: string): string {
  try {
    const u = new URL(url.startsWith('http') ? url : `https://${url}`)
    u.hash = ''
    let path = u.pathname.replace(/\/$/, '')
    if (!path) path = '/'
    const normalized = `${u.origin}${path}${u.search}`
    return createHash('sha256').update(normalized).digest('hex')
  } catch {
    return createHash('sha256').update(url).digest('hex')
  }
}
