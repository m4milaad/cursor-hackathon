import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";

const diffV = v.union(
  v.literal("easy"),
  v.literal("medium"),
  v.literal("hard"),
);

const modeV = v.union(
  v.literal("full"),
  v.literal("important"),
  v.literal("repeated"),
);

export const upsertQuestions = mutation({
  args: {
    examKey: v.string(),
    examName: v.string(),
    subject: v.string(),
    topic: v.string(),
    questions: v.array(
      v.object({
        question: v.string(),
        options: v.array(v.string()),
        correctIndex: v.number(),
        contentHash: v.string(),
        tags: v.array(v.string()),
        difficulty: diffV,
        source: v.string(),
        scrapedAt: v.number(),
        topic: v.optional(v.string()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    let inserted = 0;
    const insertedIds: Id<"examQuestions">[] = [];
    for (const q of args.questions) {
      const existing = await ctx.db
        .query("examQuestions")
        .withIndex("by_contentHash", (x) => x.eq("contentHash", q.contentHash))
        .unique();
      if (existing) {
        await ctx.db.patch(existing._id, {
          tags: [...new Set([...existing.tags, ...q.tags])],
          difficulty: q.difficulty,
        });
        continue;
      }
      const id = await ctx.db.insert("examQuestions", {
        examKey: args.examKey,
        examName: args.examName,
        subject: args.subject,
        topic: (q.topic ?? args.topic).trim() || args.topic,
        question: q.question,
        options: q.options,
        correctIndex: q.correctIndex,
        contentHash: q.contentHash,
        tags: q.tags,
        difficulty: q.difficulty,
        source: q.source,
        scrapedAt: q.scrapedAt,
      });
      insertedIds.push(id);
      inserted++;
    }

    const all = await ctx.db
      .query("examQuestions")
      .withIndex("by_examKey", (x) => x.eq("examKey", args.examKey))
      .collect();
    const now = Date.now();
    const cat = await ctx.db
      .query("examCatalog")
      .withIndex("by_examKey", (x) => x.eq("examKey", args.examKey))
      .unique();
    if (cat) {
      await ctx.db.patch(cat._id, {
        questionCount: all.length,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("examCatalog", {
        examKey: args.examKey,
        examName: args.examName,
        subject: args.subject,
        topic: args.topic,
        questionCount: all.length,
        updatedAt: now,
      });
    }
    return { inserted, insertedIds, totalForExam: all.length };
  },
});

export const listCatalog = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    const max = Math.min(limit ?? 80, 200);
    return await ctx.db
      .query("examCatalog")
      .withIndex("by_updatedAt")
      .order("desc")
      .take(max);
  },
});

export const listQuestionsByExam = query({
  args: { examKey: v.string() },
  handler: async (ctx, { examKey }) => {
    return await ctx.db
      .query("examQuestions")
      .withIndex("by_examKey", (x) => x.eq("examKey", examKey))
      .take(2000);
  },
});

export const getQuestionsByIds = query({
  args: { ids: v.array(v.id("examQuestions")) },
  handler: async (ctx, { ids }) => {
    const out = [];
    for (const id of ids) {
      const d = await ctx.db.get(id);
      if (d) out.push(d);
    }
    return out;
  },
});

export const createExamTest = mutation({
  args: {
    publicTestId: v.string(),
    examKey: v.string(),
    examName: v.string(),
    subject: v.string(),
    mode: modeV,
    durationSeconds: v.number(),
    questionIds: v.array(v.id("examQuestions")),
    sectionsJson: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("examTests", {
      ...args,
      createdAt: Date.now(),
    });
    return args.publicTestId;
  },
});

export const getTestByPublicId = query({
  args: { publicTestId: v.string() },
  handler: async (ctx, { publicTestId }) => {
    return await ctx.db
      .query("examTests")
      .withIndex("by_publicTestId", (q) => q.eq("publicTestId", publicTestId))
      .unique();
  },
});

export const recordExamAttempt = mutation({
  args: {
    deviceId: v.string(),
    testPublicId: v.string(),
    answersJson: v.string(),
    scorePercent: v.number(),
    correctCount: v.number(),
    totalCount: v.number(),
    weakTopics: v.array(v.string()),
    analysisSummary: v.string(),
    revisionSuggestions: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("examAttempts", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const listExamAttempts = query({
  args: { deviceId: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, { deviceId, limit }) => {
    const max = Math.min(limit ?? 20, 50);
    return await ctx.db
      .query("examAttempts")
      .withIndex("by_deviceId_and_createdAt", (q) => q.eq("deviceId", deviceId))
      .order("desc")
      .take(max);
  },
});
