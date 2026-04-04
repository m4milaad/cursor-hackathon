/**
 * File-based Voice CV store. Works without Convex.
 */
import fs from 'fs'
import path from 'path'

export type StoredCv = {
  publicId: string
  deviceId?: string
  name: string
  summary: string
  skills: string[]
  experience: string[]
  projects: string[]
  education: string[]
  transcript?: string
  detectedLanguage: string
  improvements: string[]
  inferredSkillNotes?: string
  cvEnglish?: {
    summary: string
    skills: string[]
    experience: string[]
    projects: string[]
    education: string[]
  }
  createdAt: number
  updatedAt: number
}

const CV_FILE = path.join(process.cwd(), '.cv-cache.json')

let cache: StoredCv[] | null = null

function load(): StoredCv[] {
  if (cache) return cache
  try {
    if (fs.existsSync(CV_FILE)) {
      cache = JSON.parse(fs.readFileSync(CV_FILE, 'utf-8')) as StoredCv[]
      return cache
    }
  } catch { /* ignore */ }
  cache = []
  return cache
}

function save(): void {
  if (!cache) return
  try {
    fs.writeFileSync(CV_FILE, JSON.stringify(cache, null, 2))
  } catch { /* ignore */ }
}

export function newPublicId(): string {
  const bytes = new Uint8Array(16)
  globalThis.crypto.getRandomValues(bytes)
  return `vc_${[...bytes].map(b => b.toString(16).padStart(2, '0')).join('')}`
}

export function saveCv(data: Omit<StoredCv, 'createdAt' | 'updatedAt'>): StoredCv {
  const cvs = load()
  const now = Date.now()
  const stored: StoredCv = { ...data, createdAt: now, updatedAt: now }

  // Replace if same publicId exists
  const idx = cvs.findIndex(c => c.publicId === data.publicId)
  if (idx >= 0) {
    stored.createdAt = cvs[idx].createdAt
    cvs[idx] = stored
  } else {
    cvs.push(stored)
  }

  save()
  return stored
}

export function getCvByPublicId(publicId: string): StoredCv | null {
  return load().find(c => c.publicId === publicId) ?? null
}

export function getCvsByDeviceId(deviceId: string): StoredCv[] {
  return load().filter(c => c.deviceId === deviceId).sort((a, b) => b.createdAt - a.createdAt)
}

export function getAllCvCount(): number {
  return load().length
}
