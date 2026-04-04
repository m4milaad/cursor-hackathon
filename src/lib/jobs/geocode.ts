/**
 * Reverse geocode for "Near me" — returns lowercase place keywords to match job text.
 */
export async function reverseGeocodeKeywords(
  lat: number,
  lng: number,
): Promise<string[]> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${encodeURIComponent(String(lat))}&lon=${encodeURIComponent(String(lng))}&format=json`
    const res = await fetch(url, {
      headers: { 'User-Agent': 'RaastaJobs/1.0 (career assistant)' },
    })
    if (!res.ok) return []
    const data = (await res.json()) as {
      address?: Record<string, string>
      display_name?: string
    }
    const a = data.address ?? {}
    const parts = [
      a.city,
      a.town,
      a.village,
      a.state,
      a.county,
      a.suburb,
      a.city_district,
    ].filter(Boolean) as string[]
    const fromDisplay = (data.display_name ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 2)
      .slice(0, 6)
    const merged = [...parts, ...fromDisplay]
    const keywords = new Set<string>()
    for (const p of merged) {
      keywords.add(p.toLowerCase())
      for (const word of p.toLowerCase().split(/\s+/)) {
        if (word.length > 2) keywords.add(word)
      }
    }
    return [...keywords]
  } catch {
    return []
  }
}
