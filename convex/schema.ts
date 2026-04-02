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
});
