/**
 * In-memory + file-based job store. Works without Convex.
 * Falls back gracefully when NEXT_PUBLIC_CONVEX_URL is not set.
 */
import { hashApplyLink } from '@/lib/jobs/hash'
import type { NormalizedJob, MatchedJob } from '@/lib/jobs/types'
import fs from 'fs'
import path from 'path'

export type StoredJob = NormalizedJob & {
  applyLinkHash: string
  scrapedAt: number
  id: string
}

export type UserProfile = {
  deviceId: string
  skills: string[]
  resumeData?: {
    skills: string[]
    experience: string[]
    roles: string[]
    rawExcerpt?: string
  }
  updatedAt: number
}

const JOBS_FILE = path.join(process.cwd(), '.job-cache.json')
const PROFILES_FILE = path.join(process.cwd(), '.profile-cache.json')

// In-memory caches
let jobsCache: StoredJob[] | null = null
let profilesCache: Map<string, UserProfile> | null = null

function loadJobs(): StoredJob[] {
  if (jobsCache) return jobsCache
  try {
    if (fs.existsSync(JOBS_FILE)) {
      const raw = fs.readFileSync(JOBS_FILE, 'utf-8')
      jobsCache = JSON.parse(raw) as StoredJob[]
      return jobsCache
    }
  } catch { /* ignore */ }
  jobsCache = []
  return jobsCache
}

function saveJobs(jobs: StoredJob[]): void {
  jobsCache = jobs
  try {
    fs.writeFileSync(JOBS_FILE, JSON.stringify(jobs, null, 2))
  } catch { /* ignore */ }
}

function loadProfiles(): Map<string, UserProfile> {
  if (profilesCache) return profilesCache
  try {
    if (fs.existsSync(PROFILES_FILE)) {
      const raw = fs.readFileSync(PROFILES_FILE, 'utf-8')
      const arr = JSON.parse(raw) as UserProfile[]
      profilesCache = new Map(arr.map(p => [p.deviceId, p]))
      return profilesCache
    }
  } catch { /* ignore */ }
  profilesCache = new Map()
  return profilesCache
}

function saveProfiles(): void {
  if (!profilesCache) return
  try {
    const arr = [...profilesCache.values()]
    fs.writeFileSync(PROFILES_FILE, JSON.stringify(arr, null, 2))
  } catch { /* ignore */ }
}

/** Upsert scraped jobs (dedup by applyLinkHash) */
export function upsertJobs(incoming: NormalizedJob[]): { inserted: number; updated: number } {
  const jobs = loadJobs()
  const byHash = new Map(jobs.map(j => [j.applyLinkHash, j]))
  let inserted = 0, updated = 0

  for (const j of incoming) {
    const h = hashApplyLink(j.applyLink)
    if (byHash.has(h)) {
      const existing = byHash.get(h)!
      Object.assign(existing, j, { scrapedAt: Date.now() })
      updated++
    } else {
      const stored: StoredJob = {
        ...j,
        applyLinkHash: h,
        scrapedAt: Date.now(),
        id: `job_${h.slice(0, 12)}_${Date.now()}`,
      }
      jobs.push(stored)
      byHash.set(h, stored)
      inserted++
    }
  }

  saveJobs(jobs)
  return { inserted, updated }
}

/** Filter jobs from local store */
export function filterJobs(opts: {
  locationScope?: string
  jobType?: string
  workType?: string
  skillFilters?: string[]
  limit?: number
}): StoredJob[] {
  const jobs = loadJobs()
  const max = Math.min(opts.limit ?? 80, 200)
  const skillsLower = (opts.skillFilters ?? []).map(s => s.toLowerCase().trim()).filter(Boolean)

  const out: StoredJob[] = []
  // Sort by most recent first
  const sorted = [...jobs].sort((a, b) => b.scrapedAt - a.scrapedAt)

  for (const row of sorted) {
    // Location filter
    if (opts.locationScope && opts.locationScope !== 'global') {
      const blob = `${row.location} ${row.description}`.toLowerCase()
      if (opts.locationScope === 'kashmir') {
        if (!/kashmir|srinagar|jammu|anantnag|baramulla|pulwama|kupwara|sopore|j&k|ladakh|remote|wfh/i.test(blob)) continue
      } else if (opts.locationScope === 'india') {
        if (!/india|delhi|mumbai|bangalore|bengaluru|hyderabad|pune|chennai|kolkata|noida|gurgaon|kashmir|srinagar|remote|wfh/i.test(blob)) continue
      }
    }

    // Job type filter
    if (opts.jobType && opts.jobType !== 'any' && row.jobType !== 'unknown' && row.jobType !== opts.jobType) continue

    // Work type filter
    if (opts.workType && opts.workType !== 'any' && row.workType !== 'unknown' && row.workType !== opts.workType) continue

    // Skills filter
    if (skillsLower.length > 0) {
      const jobSkills = row.skillsRequired.map(s => s.toLowerCase())
      const desc = row.description.toLowerCase()
      const hit = skillsLower.some(
        s => jobSkills.some(js => js.includes(s) || s.includes(js)) || desc.includes(s),
      )
      if (!hit) continue
    }

    out.push(row)
    if (out.length >= max) break
  }

  return out
}

/** Get all jobs count */
export function getJobCount(): number {
  return loadJobs().length
}

/** Get user profile */
export function getUserProfile(deviceId: string): UserProfile | null {
  const profiles = loadProfiles()
  return profiles.get(deviceId) ?? null
}

/** Upsert user profile */
export function upsertUserProfile(data: {
  deviceId: string
  skills?: string[]
  resumeData?: UserProfile['resumeData']
}): void {
  const profiles = loadProfiles()
  const existing = profiles.get(data.deviceId)
  if (existing) {
    if (data.skills) existing.skills = data.skills
    if (data.resumeData) existing.resumeData = data.resumeData
    existing.updatedAt = Date.now()
  } else {
    profiles.set(data.deviceId, {
      deviceId: data.deviceId,
      skills: data.skills ?? [],
      resumeData: data.resumeData,
      updatedAt: Date.now(),
    })
  }
  saveProfiles()
}
