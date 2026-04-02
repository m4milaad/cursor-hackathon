import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Helper function to hash passwords (simple implementation)
// In production, use bcrypt or similar
function hashPassword(password: string): string {
  // This is a simple hash - in production use bcrypt
  return Buffer.from(password).toString('base64');
}

function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

/**
 * Sign up a new user
 */
export const signUp = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    password: v.string(),
    phone: v.optional(v.string()),
    locale: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(args.email)) {
      throw new Error("Invalid email format");
    }

    // Validate password strength
    if (args.password.length < 6) {
      throw new Error("Password must be at least 6 characters");
    }

    // Hash password
    const passwordHash = hashPassword(args.password);

    // Create user
    const now = Date.now();
    const userId = await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      passwordHash,
      phone: args.phone,
      locale: args.locale,
      createdAt: now,
      updatedAt: now,
    });

    // Initialize user journey
    await ctx.db.insert("userJourney", {
      userId,
      skillsLearned: 0,
      decisionsMade: 0,
      jobApplications: 0,
      cvCreated: false,
      lastActivity: "Account created",
      updatedAt: now,
    });

    // Initialize user insights
    await ctx.db.insert("userInsights", {
      userId,
      insights: ["Welcome to RAASTA! Start exploring to get personalized insights."],
      strengths: [],
      recommendations: ["Complete your profile", "Try the Taleem module", "Explore Raah for guidance"],
      updatedAt: now,
    });

    // Create audit event
    await ctx.db.insert("auditEvents", {
      actor: args.email,
      eventType: "user_signup",
      userId,
      metadata: JSON.stringify({ name: args.name, locale: args.locale }),
      createdAt: now,
    });

    return {
      userId,
      name: args.name,
      email: args.email,
      locale: args.locale,
    };
  },
});

/**
 * Sign in an existing user
 */
export const signIn = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    // Find user by email
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user) {
      throw new Error("Invalid email or password");
    }

    // Verify password
    if (!verifyPassword(args.password, user.passwordHash)) {
      throw new Error("Invalid email or password");
    }

    // Update last seen
    await ctx.db.patch(user._id, {
      updatedAt: Date.now(),
    });

    // Create audit event
    await ctx.db.insert("auditEvents", {
      actor: args.email,
      eventType: "user_signin",
      userId: user._id,
      createdAt: Date.now(),
    });

    return {
      userId: user._id,
      name: user.name,
      email: user.email,
      locale: user.locale,
      profile: user.profile,
    };
  },
});

/**
 * Get current user profile
 */
export const getCurrentUser = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    
    if (!user) {
      return null;
    }

    return {
      userId: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      locale: user.locale,
      profile: user.profile,
      createdAt: user.createdAt,
    };
  },
});

/**
 * Update user profile
 */
export const updateProfile = mutation({
  args: {
    userId: v.id("users"),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    locale: v.optional(v.string()),
    profile: v.optional(v.object({
      age: v.optional(v.number()),
      district: v.optional(v.string()),
      occupation: v.optional(v.string()),
      education: v.optional(v.string()),
      interests: v.optional(v.array(v.string())),
    })),
  },
  handler: async (ctx, args) => {
    const { userId, ...updates } = args;

    await ctx.db.patch(userId, {
      ...updates,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Get user journey stats
 */
export const getUserJourney = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const journey = await ctx.db
      .query("userJourney")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    return journey || {
      skillsLearned: 0,
      decisionsMade: 0,
      jobApplications: 0,
      cvCreated: false,
      lastActivity: "No activity yet",
    };
  },
});

/**
 * Get user insights
 */
export const getUserInsights = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const insights = await ctx.db
      .query("userInsights")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    return insights || {
      insights: [],
      strengths: [],
      recommendations: [],
    };
  },
});

/**
 * Update user journey stats
 */
export const updateUserJourney = mutation({
  args: {
    userId: v.id("users"),
    skillsLearned: v.optional(v.number()),
    decisionsMade: v.optional(v.number()),
    jobApplications: v.optional(v.number()),
    cvCreated: v.optional(v.boolean()),
    lastActivity: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, ...updates } = args;

    const existing = await ctx.db
      .query("userJourney")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...updates,
        updatedAt: Date.now(),
      });
    }

    return { success: true };
  },
});
