import mammoth from 'mammoth'

export async function extractResumeText(
  buffer: Buffer,
  mime: string,
  filename: string,
): Promise<{ text: string; error?: string }> {
  const lower = filename.toLowerCase()
  if (mime === 'application/pdf' || lower.endsWith('.pdf')) {
    try {
      const { PDFParse } = await import('pdf-parse')
      const parser = new PDFParse({ data: buffer })
      const data = await parser.getText()
      return { text: data.text ?? '' }
    } catch (e) {
      return {
        text: '',
        error: e instanceof Error ? e.message : 'Failed to read PDF',
      }
    }
  }
  if (
    mime ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    lower.endsWith('.docx')
  ) {
    try {
      const r = await mammoth.extractRawText({ buffer })
      return { text: r.value ?? '' }
    } catch (e) {
      return {
        text: '',
        error: e instanceof Error ? e.message : 'Failed to read DOCX',
      }
    }
  }
  if (lower.endsWith('.doc') && mime === 'application/msword') {
    return {
      text: '',
      error:
        'Legacy .doc format is not supported. Please save as PDF or DOCX and upload again.',
    }
  }
  return { text: '', error: 'Unsupported format. Use PDF or DOCX.' }
}

export function fallbackResumeSkills(text: string): {
  skills: string[]
  experience: string[]
  roles: string[]
} {
  const skills: string[] = []
  const hints = [
    'JavaScript',
    'TypeScript',
    'Python',
    'Java',
    'React',
    'Node',
    'SQL',
    'AWS',
    'Docker',
    'Kubernetes',
    'Machine Learning',
    'Data Science',
    'Excel',
    'Marketing',
    'Sales',
    'Teaching',
    'Nursing',
    'Accounting',
  ]
  const lower = text.toLowerCase()
  for (const h of hints) {
    if (lower.includes(h.toLowerCase())) skills.push(h)
  }
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 8 && /experience|worked|employed|intern/i.test(l))
    .slice(0, 5)
  return {
    skills: [...new Set(skills)].slice(0, 24),
    experience: lines,
    roles: [],
  }
}
