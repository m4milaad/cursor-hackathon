import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // User authentication
  users: defineTable({
    name: v.string(),
    email: v.string(),
    passwordHash: v.string(),
    phone: v.optional(v.string()),
    locale: v.string(),
    profile: v.optional(v.object({
      age: v.optional(v.number()),
      district: v.optional(v.string()),
      occupation: v.optional(v.string()),
      education: v.optional(v.string()),
      interests: v.optional(v.array(v.string())),
    })),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_createdAt", ["createdAt"]),

  sessions: defineTable({
    userId: v.optional(v.id("users")),
    deviceId: v.string(),
    locale: v.string(),
    lastSeenAt: v.number(),
    expiresAt: v.optional(v.number()),
  })
    .index("by_deviceId", ["deviceId"])
    .index("by_userId", ["userId"]),

  requests: defineTable({
    sessionId: v.optional(v.id("sessions")),
    userId: v.optional(v.id("users")),
    mode: v.string(),
    pillar: v.optional(v.string()),
    sub: v.optional(v.string()),
    locale: v.string(),
    input: v.string(),
    response: v.optional(v.string()),
    provider: v.optional(v.string()),
    status: v.union(
      v.literal("queued"),
      v.literal("completed"),
      v.literal("error"),
    ),
    error: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_mode_and_createdAt", ["mode", "createdAt"])
    .index("by_status_and_createdAt", ["status", "createdAt"])
    .index("by_createdAt", ["createdAt"])
    .index("by_sessionId_and_createdAt", ["sessionId", "createdAt"])
    .index("by_userId_and_createdAt", ["userId", "createdAt"]),

  feedback: defineTable({
    requestId: v.id("requests"),
    userId: v.optional(v.id("users")),
    rating: v.number(),
    note: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_requestId", ["requestId"])
    .index("by_userId", ["userId"]),

  taleemResources: defineTable({
    pillar: v.string(),
    title: v.string(),
    description: v.string(),
    url: v.optional(v.string()),
    tags: v.array(v.string()),
    createdAt: v.number(),
  })
    .index("by_pillar_and_createdAt", ["pillar", "createdAt"])
    .index("by_createdAt", ["createdAt"]),

  test_records: defineTable({
    label: v.string(),
    status: v.string(),
    createdAt: v.number(),
  }).index("by_createdAt", ["createdAt"]),

  auditEvents: defineTable({
    actor: v.string(),
    eventType: v.string(),
    requestId: v.optional(v.id("requests")),
    userId: v.optional(v.id("users")),
    metadata: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_eventType_and_createdAt", ["eventType", "createdAt"])
    .index("by_createdAt", ["createdAt"])
    .index("by_userId", ["userId"]),

  // User journey tracking
  userJourney: defineTable({
    userId: v.id("users"),
    skillsLearned: v.number(),
    decisionsMade: v.number(),
    jobApplications: v.number(),
    cvCreated: v.boolean(),
    lastActivity: v.string(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),

  // Personal insights
  userInsights: defineTable({
    userId: v.id("users"),
    insights: v.array(v.string()),
    strengths: v.array(v.string()),
    recommendations: v.array(v.string()),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),

  /** Normalized job listings from scraping (deduped by apply link hash) */
  jobListings: defineTable({
    title: v.string(),
    company: v.string(),
    location: v.string(),
    jobType: v.union(
      v.literal("remote"),
      v.literal("onsite"),
      v.literal("hybrid"),
      v.literal("unknown"),
    ),
    workType: v.union(
      v.literal("full_time"),
      v.literal("part_time"),
      v.literal("internship"),
      v.literal("freelance"),
      v.literal("unknown"),
    ),
    skillsRequired: v.array(v.string()),
    description: v.string(),
    applyLink: v.string(),
    applyLinkHash: v.string(),
    source: v.string(),
    scrapedAt: v.number(),
  })
    .index("by_applyLinkHash", ["applyLinkHash"])
    .index("by_scrapedAt", ["scrapedAt"]),

  /** Public voice-generated CV (Whisper + AI); shareable via /profile/[publicId] */
  voiceCvProfiles: defineTable({
    publicId: v.string(),
    deviceId: v.optional(v.string()),
    name: v.string(),
    summary: v.string(),
    skills: v.array(v.string()),
    experience: v.array(v.string()),
    projects: v.array(v.string()),
    education: v.array(v.string()),
    transcript: v.optional(v.string()),
    detectedLanguage: v.string(),
    improvements: v.array(v.string()),
    inferredSkillNotes: v.optional(v.string()),
    cvEnglish: v.optional(
      v.object({
        summary: v.string(),
        skills: v.array(v.string()),
        experience: v.array(v.string()),
        projects: v.array(v.string()),
        education: v.array(v.string()),
      }),
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_publicId", ["publicId"])
    .index("by_deviceId", ["deviceId"]),

  /** Exam catalog entries (one row per exam+subject+topic key) */
  examCatalog: defineTable({
    examKey: v.string(),
    examName: v.string(),
    subject: v.string(),
    topic: v.string(),
    questionCount: v.number(),
    updatedAt: v.number(),
  })
    .index("by_examKey", ["examKey"])
    .index("by_updatedAt", ["updatedAt"]),

  /** Scraped or AI-tagged exam questions (MCQ); deduped by contentHash */
  examQuestions: defineTable({
    examKey: v.string(),
    examName: v.string(),
    subject: v.string(),
    topic: v.string(),
    question: v.string(),
    options: v.array(v.string()),
    correctIndex: v.number(),
    contentHash: v.string(),
    tags: v.array(v.string()),
    difficulty: v.union(
      v.literal("easy"),
      v.literal("medium"),
      v.literal("hard"),
    ),
    source: v.string(),
    scrapedAt: v.number(),
  })
    .index("by_examKey", ["examKey"])
    .index("by_contentHash", ["contentHash"]),

  /** Generated test papers (references question ids) */
  examTests: defineTable({
    publicTestId: v.string(),
    examKey: v.string(),
    examName: v.string(),
    subject: v.string(),
    mode: v.union(
      v.literal("full"),
      v.literal("important"),
      v.literal("repeated"),
    ),
    durationSeconds: v.number(),
    questionIds: v.array(v.id("examQuestions")),
    sectionsJson: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_publicTestId", ["publicTestId"]),

  /** User test attempts + AI feedback */
  examAttempts: defineTable({
    deviceId: v.string(),
    testPublicId: v.string(),
    answersJson: v.string(),
    scorePercent: v.number(),
    correctCount: v.number(),
    totalCount: v.number(),
    weakTopics: v.array(v.string()),
    analysisSummary: v.string(),
    revisionSuggestions: v.array(v.string()),
    createdAt: v.number(),
  })
    .index("by_deviceId_and_createdAt", ["deviceId", "createdAt"])
    .index("by_testPublicId", ["testPublicId"]),

  /** Anonymous job seeker profile (skills + parsed resume) keyed by device id */
  userJobProfiles: defineTable({
    deviceId: v.string(),
    skills: v.array(v.string()),
    resumeData: v.optional(
      v.object({
        skills: v.array(v.string()),
        experience: v.array(v.string()),
        roles: v.array(v.string()),
        rawExcerpt: v.optional(v.string()),
      }),
    ),
    updatedAt: v.number(),
  }).index("by_deviceId", ["deviceId"]),
});
