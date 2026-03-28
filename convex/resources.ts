import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const addTaleemResource = mutation({
  args: {
    pillar: v.string(),
    title: v.string(),
    description: v.string(),
    url: v.optional(v.string()),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("taleemResources", {
      pillar: args.pillar,
      title: args.title,
      description: args.description,
      url: args.url,
      tags: args.tags,
      createdAt: Date.now(),
    });
  },
});

export const listTaleemResources = query({
  args: {
    pillar: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.max(1, Math.min(args.limit ?? 20, 50));
    if (args.pillar) {
      return await ctx.db
        .query("taleemResources")
        .withIndex("by_pillar_and_createdAt", (q) => q.eq("pillar", args.pillar!))
        .order("desc")
        .take(limit);
    }

    return await ctx.db
      .query("taleemResources")
      .withIndex("by_createdAt")
      .order("desc")
      .take(limit);
  },
});
