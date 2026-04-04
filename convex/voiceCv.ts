import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const cvEnglishV = v.object({
  summary: v.string(),
  skills: v.array(v.string()),
  experience: v.array(v.string()),
  projects: v.array(v.string()),
  education: v.array(v.string()),
});

export const createVoiceCv = mutation({
  args: {
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
    cvEnglish: v.optional(cvEnglishV),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const id = await ctx.db.insert("voiceCvProfiles", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
    return { id, publicId: args.publicId };
  },
});

export const getByPublicId = query({
  args: { publicId: v.string() },
  handler: async (ctx, { publicId }) => {
    return await ctx.db
      .query("voiceCvProfiles")
      .withIndex("by_publicId", (q) => q.eq("publicId", publicId))
      .unique();
  },
});
