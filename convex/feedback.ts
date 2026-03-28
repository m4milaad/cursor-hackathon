import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const submitFeedback = mutation({
  args: {
    requestId: v.id("requests"),
    rating: v.number(),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const clampedRating = Math.max(1, Math.min(5, Math.round(args.rating)));
    return await ctx.db.insert("feedback", {
      requestId: args.requestId,
      rating: clampedRating,
      note: args.note,
      createdAt: Date.now(),
    });
  },
});

export const listFeedbackForRequest = query({
  args: {
    requestId: v.id("requests"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("feedback")
      .withIndex("by_requestId", (q) => q.eq("requestId", args.requestId))
      .order("desc")
      .take(20);
  },
});
