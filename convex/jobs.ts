import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const jobTypeV = v.union(
  v.literal("remote"),
  v.literal("onsite"),
  v.literal("hybrid"),
  v.literal("unknown"),
);

const workTypeV = v.union(
  v.literal("full_time"),
  v.literal("part_time"),
  v.literal("internship"),
  v.literal("freelance"),
  v.literal("unknown"),
);

export const upsertJobs = mutation({
  args: {
    jobs: v.array(
      v.object({
        title: v.string(),
        company: v.string(),
        location: v.string(),
        jobType: jobTypeV,
        workType: workTypeV,
        skillsRequired: v.array(v.string()),
        description: v.string(),
        applyLink: v.string(),
        applyLinkHash: v.string(),
        source: v.string(),
        scrapedAt: v.number(),
      }),
    ),
  },
  handler: async (ctx, { jobs }) => {
    let inserted = 0;
    let updated = 0;
    for (const j of jobs) {
      const existing = await ctx.db
        .query("jobListings")
        .withIndex("by_applyLinkHash", (q) => q.eq("applyLinkHash", j.applyLinkHash))
        .unique();
      if (existing) {
        await ctx.db.patch(existing._id, {
          title: j.title,
          company: j.company,
          location: j.location,
          jobType: j.jobType,
          workType: j.workType,
          skillsRequired: j.skillsRequired,
          description: j.description,
          applyLink: j.applyLink,
          source: j.source,
          scrapedAt: j.scrapedAt,
        });
        updated++;
      } else {
        await ctx.db.insert("jobListings", j);
        inserted++;
      }
    }
    return { inserted, updated };
  },
});

function matchesLocationScope(
  location: string,
  description: string,
  scope: "kashmir" | "india" | "global" | "near_me",
  nearKeywords: string[] | undefined,
): boolean {
  const blob = `${location} ${description}`.toLowerCase();
  if (scope === "global") return true;
  const kashmirHints =
    /kashmir|srinagar|jammu|anantnag|baramulla|pulwama|kupwara|sopore|udhampur|leh|ladakh|j&k|jammu and kashmir/;
  const indiaHints =
    /india|delhi|mumbai|bangalore|bengaluru|hyderabad|pune|chennai|kolkata|noida|gurgaon|gurugram|ahmedabad|kochi|jaipur/;
  if (scope === "kashmir") {
    return kashmirHints.test(blob) || /remote|work from home|wfh/.test(blob);
  }
  if (scope === "india") {
    return indiaHints.test(blob) || kashmirHints.test(blob) || /remote|wfh|india/.test(blob);
  }
  if (scope === "near_me" && nearKeywords?.length) {
    return nearKeywords.some((k) => blob.includes(k.toLowerCase())) || /remote|wfh/.test(blob);
  }
  if (scope === "near_me") {
    return kashmirHints.test(blob) || /remote|wfh/.test(blob);
  }
  return true;
}

function matchesJobType(
  jobType: "remote" | "onsite" | "hybrid" | "unknown",
  filter: "remote" | "onsite" | "hybrid" | "any",
): boolean {
  if (filter === "any") return true;
  if (jobType === "unknown") return true;
  return jobType === filter;
}

function matchesWorkType(
  workType:
    | "full_time"
    | "part_time"
    | "internship"
    | "freelance"
    | "unknown",
  filter:
    | "full_time"
    | "part_time"
    | "internship"
    | "freelance"
    | "any",
): boolean {
  if (filter === "any") return true;
  if (workType === "unknown") return true;
  return workType === filter;
}

export const listJobs = query({
  args: {
    locationScope: v.union(
      v.literal("kashmir"),
      v.literal("india"),
      v.literal("global"),
      v.literal("near_me"),
    ),
    jobType: v.union(
      v.literal("any"),
      v.literal("remote"),
      v.literal("onsite"),
      v.literal("hybrid"),
    ),
    workType: v.union(
      v.literal("any"),
      v.literal("full_time"),
      v.literal("part_time"),
      v.literal("internship"),
      v.literal("freelance"),
    ),
    skillFilters: v.optional(v.array(v.string())),
    nearKeywords: v.optional(v.array(v.string())),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const max = Math.min(args.limit ?? 80, 200);
    const rows = await ctx.db
      .query("jobListings")
      .withIndex("by_scrapedAt", (q) => q)
      .order("desc")
      .take(500);

    const skillsLower = (args.skillFilters ?? []).map((s) => s.toLowerCase().trim()).filter(Boolean);

    const out: typeof rows = [];
    for (const row of rows) {
      if (!matchesLocationScope(row.location, row.description, args.locationScope, args.nearKeywords))
        continue;
      if (!matchesJobType(row.jobType, args.jobType)) continue;
      if (!matchesWorkType(row.workType, args.workType)) continue;
      if (skillsLower.length > 0) {
        const jobSkills = row.skillsRequired.map((s) => s.toLowerCase());
        const desc = row.description.toLowerCase();
        const hit = skillsLower.some(
          (s) => jobSkills.some((js) => js.includes(s) || s.includes(js)) || desc.includes(s),
        );
        if (!hit) continue;
      }
      out.push(row);
      if (out.length >= max) break;
    }
    return out;
  },
});

export const getJobsByIds = query({
  args: { ids: v.array(v.id("jobListings")) },
  handler: async (ctx, { ids }) => {
    const out = [];
    for (const id of ids) {
      const doc = await ctx.db.get(id);
      if (doc) out.push(doc);
    }
    return out;
  },
});

export const getUserJobProfile = query({
  args: { deviceId: v.string() },
  handler: async (ctx, { deviceId }) => {
    return await ctx.db
      .query("userJobProfiles")
      .withIndex("by_deviceId", (q) => q.eq("deviceId", deviceId))
      .unique();
  },
});

export const upsertUserJobProfile = mutation({
  args: {
    deviceId: v.string(),
    skills: v.optional(v.array(v.string())),
    resumeData: v.optional(
      v.object({
        skills: v.array(v.string()),
        experience: v.array(v.string()),
        roles: v.array(v.string()),
        rawExcerpt: v.optional(v.string()),
      }),
    ),
  },
  handler: async (ctx, { deviceId, skills, resumeData }) => {
    const now = Date.now();
    const existing = await ctx.db
      .query("userJobProfiles")
      .withIndex("by_deviceId", (q) => q.eq("deviceId", deviceId))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, {
        skills: skills ?? existing.skills,
        resumeData: resumeData ?? existing.resumeData,
        updatedAt: now,
      });
      return existing._id;
    }
    return await ctx.db.insert("userJobProfiles", {
      deviceId,
      skills: skills ?? [],
      resumeData,
      updatedAt: now,
    });
  },
});

export const setManualSkills = mutation({
  args: { deviceId: v.string(), skills: v.array(v.string()) },
  handler: async (ctx, { deviceId, skills }) => {
    const now = Date.now();
    const existing = await ctx.db
      .query("userJobProfiles")
      .withIndex("by_deviceId", (q) => q.eq("deviceId", deviceId))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, { skills, updatedAt: now });
      return existing._id;
    }
    return await ctx.db.insert("userJobProfiles", {
      deviceId,
      skills,
      updatedAt: now,
    });
  },
});
