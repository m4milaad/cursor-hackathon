import { createHash } from 'crypto'

export function hashQuestionContent(question: string, options: string[]): string {
  const norm = `${question.trim().toLowerCase()}|${options.map((o) => o.trim().toLowerCase()).join('|')}`
  return createHash('sha256').update(norm).digest('hex')
}

export function makeExamKey(
  examName: string,
  subject: string,
  topic: string,
): string {
  const slug = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 48) || 'x'
  return `${slug(examName)}|${slug(subject)}|${slug(topic || 'general')}`
}
