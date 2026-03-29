'use client'

import { useCallback, useEffect, useState } from 'react'

type NewsItem = {
  title: string
  link: string
  pubDate: string
  source: string
}

type NewsCornerProps = {
  field: 'zameen' | 'taleem' | 'raah' | 'samjho'
  title: string
  subtitle?: string
}

export function NewsCorner({ field, title, subtitle = 'News Corner' }: NewsCornerProps) {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([])
  const [newsLoading, setNewsLoading] = useState(true)
  const [newsError, setNewsError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const loadNews = async () => {
      try {
        setNewsLoading(true)
        setNewsError(null)
        const response = await fetch(`/api/news?field=${field}`, { cache: 'no-store' })
        const data = await response.json()
        if (!cancelled) {
          setNewsItems(Array.isArray(data.items) ? data.items : [])
        }
      } catch (error) {
        if (!cancelled) {
          console.error('News fetch error:', error)
          setNewsError('Unable to load updates right now.')
          setNewsItems([])
        }
      } finally {
        if (!cancelled) {
          setNewsLoading(false)
        }
      }
    }
    loadNews()
    const interval = setInterval(loadNews, 5 * 60 * 1000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [field])

  const classifyNews = useCallback((headline: string) => {
    const normalized = headline.toLowerCase()
    if (/(alert|warning|ban|outbreak|pest|disease|flood|storm)/.test(normalized)) return 'Alert'
    if (/(report|survey|policy|scheme|subsidy|budget|notice)/.test(normalized)) return 'Report'
    if (/(research|study|trial|innovation|university|paper)/.test(normalized)) return 'Research'
    return 'Update'
  }, [])

  const formatNewsDate = useCallback((value: string) => {
    if (!value) return 'Just now'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return 'Recently'
    return date.toLocaleString('en-IN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }, [])

  return (
    <div className="bg-[var(--color-surface-container-low)] p-8 border-t-4 border-[var(--color-primary)]">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <p className="font-label text-[10px] uppercase tracking-[0.2em] text-[var(--color-secondary)] mb-2">
            {subtitle}
          </p>
          <h3 className="font-headline text-2xl">{title}</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-[var(--color-secondary)] rounded-full animate-pulse"></span>
          <span className="font-label text-[10px] uppercase tracking-widest text-[var(--color-secondary)]">
            Real-time
          </span>
        </div>
      </div>

      {newsLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={`news-skel-${idx}`}
              className="h-16 bg-[var(--color-surface-container-high)] animate-pulse"
            />
          ))}
        </div>
      ) : newsError ? (
        <div className="bg-[var(--color-surface-container-high)] p-4 text-sm text-[var(--color-on-surface-variant)]">
          {newsError}
        </div>
      ) : newsItems.length === 0 ? (
        <div className="bg-[var(--color-surface-container-high)] p-4 text-sm text-[var(--color-on-surface-variant)]">
          No fresh headlines yet. Check back soon.
        </div>
      ) : (
        <div className="space-y-4">
          {newsItems.map((item, idx) => (
            <a
              key={`${item.link}-${idx}`}
              href={item.link}
              target="_blank"
              rel="noreferrer"
              className="block border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] p-4 hover:border-[var(--color-secondary)] transition-colors"
            >
              <div className="flex items-center justify-between gap-4 mb-2">
                <span className="font-label text-[10px] uppercase tracking-widest text-[var(--color-secondary)]">
                  {classifyNews(item.title)}
                </span>
                <span className="text-[10px] uppercase tracking-widest text-[var(--color-on-surface-variant)]">
                  {formatNewsDate(item.pubDate)}
                </span>
              </div>
              <p className="font-headline text-base text-[var(--color-primary)] leading-snug">
                {item.title}
              </p>
              <p className="text-xs uppercase tracking-widest text-[var(--color-on-surface-variant)] mt-2">
                {item.source || 'Regional Desk'}
              </p>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
