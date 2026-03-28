import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  sessions: defineTable({
    deviceId: v.string(),
    locale: v.string(),
    lastSeenAt: v.number(),
  }).index("by_deviceId", ["deviceId"]),

  requests: defineTable({
    sessionId: v.optional(v.id("sessions")),
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
    .index("by_sessionId_and_createdAt", ["sessionId", "createdAt"]),

  feedback: defineTable({
    requestId: v.id("requests"),
    rating: v.number(),
    note: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_requestId", ["requestId"]),

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
    metadata: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_eventType_and_createdAt", ["eventType", "createdAt"])
    .index("by_createdAt", ["createdAt"]),
});
