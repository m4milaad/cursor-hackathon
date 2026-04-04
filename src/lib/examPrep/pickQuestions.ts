import type { Doc } from '../../../convex/_generated/dataModel'

export type ExamQuestionDoc = Doc<'examQuestions'>

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function filterPool(
  rows: ExamQuestionDoc[],
  mode: 'full' | 'important' | 'repeated',
  difficulty: 'all' | 'easy' | 'medium' | 'hard' | 'mixed',
): ExamQuestionDoc[] {
  let pool = [...rows]
  if (mode === 'important') {
    pool = pool.filter((q) => q.tags.includes('important'))
  } else if (mode === 'repeated') {
    pool = pool.filter((q) => q.tags.includes('repeated'))
  }
  if (difficulty === 'all' || difficulty === 'mixed') {
    return pool
  }
  if (difficulty === 'easy' || difficulty === 'medium' || difficulty === 'hard') {
    return pool.filter((q) => q.difficulty === difficulty)
  }
  return pool
}

export function pickMixedDifficulty(
  rows: ExamQuestionDoc[],
  n: number,
): ExamQuestionDoc[] {
  const by: Record<string, ExamQuestionDoc[]> = {
    easy: [],
    medium: [],
    hard: [],
  }
  for (const r of rows) {
    by[r.difficulty].push(r)
  }
  const out: ExamQuestionDoc[] = []
  const third = Math.ceil(n / 3)
  for (const level of ['easy', 'medium', 'hard'] as const) {
    out.push(...shuffle(by[level]).slice(0, third))
  }
  const seen = new Set(out.map((q) => q._id))
  const rest = shuffle(rows.filter((r) => !seen.has(r._id)))
  while (out.length < n && rest.length) {
    const r = rest.pop()!
    if (!seen.has(r._id)) {
      seen.add(r._id)
      out.push(r)
    }
  }
  return shuffle(out).slice(0, n)
}
