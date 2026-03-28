import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const backendHealth = query({
  args: {},
  handler: async (ctx) => {
    const recent = await ctx.db
      .query("requests")
      .withIndex("by_createdAt")
      .order("desc")
      .take(200);
    const recentEvents = await ctx.db
      .query("auditEvents")
      .withIndex("by_createdAt")
      .order("desc")
      .take(100);

    const statusCounts: Record<string, number> = {};
    const modeCounts: Record<string, number> = {};

    for (const row of recent) {
      statusCounts[row.status] = (statusCounts[row.status] ?? 0) + 1;
      modeCounts[row.mode] = (modeCounts[row.mode] ?? 0) + 1;
    }

    return {
      recentWindow: recent.length,
      recentEventWindow: recentEvents.length,
      statusCounts,
      modeCounts,
      updatedAt: Date.now(),
    };
  },
});

export const listByStatus = query({
  args: {
    status: v.union(
      v.literal("queued"),
      v.literal("completed"),
      v.literal("error"),
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.max(1, Math.min(args.limit ?? 20, 50));
    return await ctx.db
      .query("requests")
      .withIndex("by_status_and_createdAt", (q) => q.eq("status", args.status))
      .order("desc")
      .take(limit);
  },
});

export const purgeTestData = mutation({
  args: {
    table: v.union(
      v.literal("auditEvents"),
      v.literal("feedback"),
      v.literal("requests"),
      v.literal("sessions"),
      v.literal("taleemResources"),
      v.literal("test_records"),
    ),
    maxDeletes: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const maxDeletes = Math.max(1, Math.min(args.maxDeletes ?? 100, 500));
    const rows = await ctx.db.query(args.table).take(maxDeletes);
    for (const row of rows) {
      await ctx.db.delete(row._id);
    }
    return { deleted: rows.length, table: args.table };
  },
});
