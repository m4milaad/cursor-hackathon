import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";

const MAX_LIST_LIMIT = 50;

export const createRequest = mutation({
  args: {
    mode: v.string(),
    pillar: v.optional(v.string()),
    sub: v.optional(v.string()),
    locale: v.string(),
    input: v.string(),
    deviceId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    let sessionId = undefined;

    if (args.deviceId) {
      const existingSession = await ctx.db
        .query("sessions")
        .withIndex("by_deviceId", (q) => q.eq("deviceId", args.deviceId!))
        .unique();

      if (existingSession) {
        sessionId = existingSession._id;
        await ctx.db.patch(existingSession._id, {
          locale: args.locale,
          lastSeenAt: now,
        });
      } else {
        sessionId = await ctx.db.insert("sessions", {
          deviceId: args.deviceId,
          locale: args.locale,
          lastSeenAt: now,
        });
      }
    }

    const requestId = await ctx.db.insert("requests", {
      sessionId,
      mode: args.mode,
      pillar: args.pillar,
      sub: args.sub,
      locale: args.locale,
      input: args.input,
      status: "queued",
      createdAt: now,
      updatedAt: now,
    });

    await ctx.runMutation(internal.audit.writeEvent, {
      actor: "system",
      eventType: "request.created",
      requestId,
      metadata: JSON.stringify({
        mode: args.mode,
        locale: args.locale,
      }),
    });

    return requestId;
  },
});

export const completeRequest = mutation({
  args: {
    requestId: v.id("requests"),
    response: v.string(),
    provider: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.requestId, {
      response: args.response,
      provider: args.provider ?? "unknown",
      status: "completed",
      updatedAt: Date.now(),
    });
    await ctx.runMutation(internal.audit.writeEvent, {
      actor: "system",
      eventType: "request.completed",
      requestId: args.requestId,
      metadata: JSON.stringify({
        provider: args.provider ?? "unknown",
      }),
    });
    return { ok: true };
  },
});

export const failRequest = mutation({
  args: {
    requestId: v.id("requests"),
    error: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.requestId, {
      status: "error",
      error: args.error,
      updatedAt: Date.now(),
    });
    await ctx.runMutation(internal.audit.writeEvent, {
      actor: "system",
      eventType: "request.failed",
      requestId: args.requestId,
      metadata: args.error.slice(0, 500),
    });
    return { ok: true };
  },
});

export const getRequest = query({
  args: {
    requestId: v.id("requests"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.requestId);
  },
});

export const listRecentRequests = query({
  args: {
    limit: v.optional(v.number()),
    mode: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = Math.max(1, Math.min(args.limit ?? 20, MAX_LIST_LIMIT));
    if (args.mode) {
      return await ctx.db
        .query("requests")
        .withIndex("by_mode_and_createdAt", (q) => q.eq("mode", args.mode!))
        .order("desc")
        .take(limit);
    }

    return await ctx.db
      .query("requests")
      .withIndex("by_createdAt")
      .order("desc")
      .take(limit);
  },
});

export const modeSummary = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db
      .query("requests")
      .withIndex("by_createdAt")
      .order("desc")
      .take(500);

    const counts: Record<string, number> = {};
    for (const row of rows) {
      counts[row.mode] = (counts[row.mode] ?? 0) + 1;
    }

    return counts;
  },
});
