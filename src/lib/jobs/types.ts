export type JobLocationScope = 'kashmir' | 'india' | 'global' | 'near_me'

export type JobTypeFilter = 'remote' | 'onsite' | 'hybrid' | 'any'

export type WorkTypeFilter =
  | 'full_time'
  | 'part_time'
  | 'internship'
  | 'freelance'
  | 'any'

export type NormalizedJob = {
  title: string
  company: string
  location: string
  jobType: 'remote' | 'onsite' | 'hybrid' | 'unknown'
  workType: 'full_time' | 'part_time' | 'internship' | 'freelance' | 'unknown'
  skillsRequired: string[]
  description: string
  applyLink: string
  source: string
}

export type ResumeParseResult = {
  skills: string[]
  experience: string[]
  roles: string[]
}

export type MatchedJob = {
  jobId: string
  title: string
  company: string
  location: string
  applyLink: string
  matchScore: number
  matchingSkills: string[]
  missingSkills: string[]
  recommendation: string
}
