import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";

export const writeEvent = internalMutation({
  args: {
    actor: v.string(),
    eventType: v.string(),
    requestId: v.optional(v.id("requests")),
    metadata: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("auditEvents", {
      actor: args.actor,
      eventType: args.eventType,
      requestId: args.requestId,
      metadata: args.metadata,
      createdAt: Date.now(),
    });
  },
});

export const listRecentEvents = query({
  args: {
    limit: v.optional(v.number()),
    eventType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = Math.max(1, Math.min(args.limit ?? 30, 100));
    if (args.eventType) {
      return await ctx.db
        .query("auditEvents")
        .withIndex("by_eventType_and_createdAt", (q) =>
          q.eq("eventType", args.eventType!),
        )
        .order("desc")
        .take(limit);
    }
    return await ctx.db
      .query("auditEvents")
      .withIndex("by_createdAt")
      .order("desc")
      .take(limit);
  },
});
