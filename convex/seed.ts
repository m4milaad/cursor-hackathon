import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { internal } from "./_generated/api";

export const createTestData = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const rows = [
      { label: "alpha", status: "new", createdAt: now },
      { label: "beta", status: "in_progress", createdAt: now + 1 },
      { label: "gamma", status: "done", createdAt: now + 2 },
    ];

    const ids = [];
    for (const row of rows) {
      const id = await ctx.db.insert("test_records", row);
      ids.push(id);
    }

    return { inserted: ids.length, ids };
  },
});

export const seedBackend = mutation({
  args: {
    reset: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    if (args.reset) {
      const toDeleteRequests = await ctx.db.query("requests").take(200);
      for (const row of toDeleteRequests) {
        await ctx.db.delete(row._id);
      }

      const toDeleteSessions = await ctx.db.query("sessions").take(200);
      for (const row of toDeleteSessions) {
        await ctx.db.delete(row._id);
      }

      const toDeleteFeedback = await ctx.db.query("feedback").take(200);
      for (const row of toDeleteFeedback) {
        await ctx.db.delete(row._id);
      }

      const toDeleteResources = await ctx.db.query("taleemResources").take(200);
      for (const row of toDeleteResources) {
        await ctx.db.delete(row._id);
      }

      const toDeleteTestRecords = await ctx.db.query("test_records").take(200);
      for (const row of toDeleteTestRecords) {
        await ctx.db.delete(row._id);
      }

      const toDeleteEvents = await ctx.db.query("auditEvents").take(200);
      for (const row of toDeleteEvents) {
        await ctx.db.delete(row._id);
      }
    }

    const now = Date.now();
    const sessionId = await ctx.db.insert("sessions", {
      deviceId: "demo-device-1",
      locale: "ur",
      lastSeenAt: now,
    });

    const requestIds = [];
    requestIds.push(
      await ctx.db.insert("requests", {
        sessionId,
        mode: "samjho",
        locale: "ur",
        input: "Explain this land notice",
        response: "This notice asks for land records by the 15th.",
        provider: "demo",
        status: "completed",
        createdAt: now,
        updatedAt: now,
      }),
    );

    requestIds.push(
      await ctx.db.insert("requests", {
        sessionId,
        mode: "zameen",
        locale: "ur",
        input: "Apple leaf disease help",
        response: "Looks like early fungal signs. Use copper spray.",
        provider: "demo",
        status: "completed",
        createdAt: now + 1,
        updatedAt: now + 1,
      }),
    );

    await ctx.db.insert("feedback", {
      requestId: requestIds[0],
      rating: 5,
      note: "Very clear answer.",
      createdAt: now + 2,
    });

    await ctx.db.insert("taleemResources", {
      pillar: "hunarmand",
      title: "PM Mudra Yojana",
      description: "Micro-loans for small businesses and youth starters.",
      url: "https://www.mudra.org.in/",
      tags: ["loan", "startup", "scheme"],
      createdAt: now + 3,
    });

    await ctx.db.insert("taleemResources", {
      pillar: "kaam",
      title: "National Career Service",
      description: "Government job listings and career support portal.",
      url: "https://www.ncs.gov.in/",
      tags: ["jobs", "career", "government"],
      createdAt: now + 4,
    });

    const test = await ctx.db.insert("test_records", {
      label: "backend-seed",
      status: "ok",
      createdAt: now + 5,
    });

    await ctx.runMutation(internal.audit.writeEvent, {
      actor: "seed",
      eventType: "backend.seeded",
      metadata: JSON.stringify({ reset: Boolean(args.reset) }),
    });

    return {
      seeded: true,
      sessionId,
      requestIds,
      testRecordId: test,
    };
  },
});
