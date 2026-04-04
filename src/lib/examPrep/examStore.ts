/**
 * File-based exam question & attempt store. Works without Convex.
 */
import fs from 'fs'
import path from 'path'
import type { TaggedMcq } from '@/lib/examPrep/examAi'

export type StoredQuestion = TaggedMcq & {
  id: string
  exam: string
  subject: string
  source: string
  storedAt: number
}

export type TestPaper = {
  id: string
  exam: string
  subject: string
  topic: string
  mode: 'full' | 'important' | 'repeated'
  difficulty: 'all' | 'easy' | 'medium' | 'hard' | 'mixed'
  questions: StoredQuestion[]
  durationMinutes: number
  createdAt: number
}

export type UserAttempt = {
  id: string
  testId: string
  deviceId: string
  answers: (number | null)[]
  score: number
  total: number
  wrongTopics: string[]
  correctTopics: string[]
  submittedAt: number
  analysis?: {
    weakTopics: string[]
    summary: string
    revision: string[]
  }
}

const Q_FILE = path.join(process.cwd(), '.exam-questions.json')
const T_FILE = path.join(process.cwd(), '.exam-tests.json')
const A_FILE = path.join(process.cwd(), '.exam-attempts.json')

let qCache: StoredQuestion[] | null = null
let tCache: TestPaper[] | null = null
let aCache: UserAttempt[] | null = null

function loadFile<T>(file: string): T[] {
  try {
    if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, 'utf-8')) as T[]
  } catch { /* ignore */ }
  return []
}

function saveFile<T>(file: string, data: T[]): void {
  try { fs.writeFileSync(file, JSON.stringify(data, null, 2)) } catch { /* ignore */ }
}

function loadQuestions(): StoredQuestion[] {
  if (!qCache) qCache = loadFile<StoredQuestion>(Q_FILE)
  return qCache
}

function loadTests(): TestPaper[] {
  if (!tCache) tCache = loadFile<TestPaper>(T_FILE)
  return tCache
}

function loadAttempts(): UserAttempt[] {
  if (!aCache) aCache = loadFile<UserAttempt>(A_FILE)
  return aCache
}

export function getQuestionCount(exam?: string): number {
  const qs = loadQuestions()
  return exam ? qs.filter(q => q.exam === exam).length : qs.length
}

export function upsertQuestions(items: TaggedMcq[], exam: string, subject: string, source: string): number {
  const qs = loadQuestions()
  const existing = new Set(qs.map(q => `${q.question.toLowerCase().trim().slice(0, 60)}`))
  let added = 0
  for (const item of items) {
    const key = item.question.toLowerCase().trim().slice(0, 60)
    if (existing.has(key)) continue
    existing.add(key)
    qs.push({
      ...item,
      id: `eq_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      exam,
      subject,
      source,
      storedAt: Date.now(),
    })
    added++
  }
  qCache = qs
  saveFile(Q_FILE, qs)
  return added
}

export function getQuestions(opts: {
  exam: string
  subject?: string
  topic?: string
  mode?: 'full' | 'important' | 'repeated'
  difficulty?: 'all' | 'easy' | 'medium' | 'hard' | 'mixed'
  limit?: number
}): StoredQuestion[] {
  let pool = loadQuestions().filter(q => q.exam === opts.exam)
  if (opts.subject) pool = pool.filter(q => q.subject === opts.subject)
  if (opts.topic) pool = pool.filter(q => q.topic.toLowerCase().includes(opts.topic!.toLowerCase()))
  if (opts.mode === 'important') pool = pool.filter(q => q.tags.includes('important'))
  if (opts.mode === 'repeated') pool = pool.filter(q => q.tags.includes('repeated'))
  if (opts.difficulty && opts.difficulty !== 'all' && opts.difficulty !== 'mixed') {
    pool = pool.filter(q => q.difficulty === opts.difficulty)
  }
  // Shuffle
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  // Mixed difficulty: balance
  if (opts.difficulty === 'mixed' && pool.length > 3) {
    const groups: Record<string, StoredQuestion[]> = { easy: [], medium: [], hard: [] }
    for (const q of pool) groups[q.difficulty]?.push(q)
    const lim = Math.ceil((opts.limit ?? 20) / 3)
    pool = [...groups.easy.slice(0, lim), ...groups.medium.slice(0, lim), ...groups.hard.slice(0, lim)]
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[pool[i], pool[j]] = [pool[j], pool[i]]
    }
  }
  return pool.slice(0, opts.limit ?? 200)
}

export function saveTest(test: TestPaper): void {
  const tests = loadTests()
  tests.push(test)
  tCache = tests
  saveFile(T_FILE, tests)
}

export function getTest(id: string): TestPaper | null {
  return loadTests().find(t => t.id === id) ?? null
}

export function saveAttempt(attempt: UserAttempt): void {
  const attempts = loadAttempts()
  attempts.push(attempt)
  aCache = attempts
  saveFile(A_FILE, attempts)
}

export function getAttemptsByDevice(deviceId: string): UserAttempt[] {
  return loadAttempts().filter(a => a.deviceId === deviceId).sort((a, b) => b.submittedAt - a.submittedAt)
}
