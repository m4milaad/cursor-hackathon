"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";

function buildSystemPrompt(mode: string): string {
  if (mode === "samjho") {
    return "Explain legal or government text in simple language with clear next steps.";
  }
  if (mode === "zameen") {
    return "Give practical crop and mandi guidance in concise voice-friendly wording.";
  }
  if (mode === "taleem") {
    return "Guide youth with practical education, jobs, and scheme advice.";
  }
  return "Act as a concise assistant for rural support use-cases.";
}

export const submitPrompt = action({
  args: {
    mode: v.string(),
    pillar: v.optional(v.string()),
    sub: v.optional(v.string()),
    locale: v.string(),
    input: v.string(),
    deviceId: v.optional(v.string()),
    model: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const requestId = await ctx.runMutation(api.requests.createRequest, {
      mode: args.mode,
      pillar: args.pillar,
      sub: args.sub,
      locale: args.locale,
      input: args.input,
      deviceId: args.deviceId,
    });

    const system = buildSystemPrompt(args.mode);
    const result = await ctx.runAction(api.ai.generateReply, {
      requestId,
      system,
      prompt: args.input,
      model: args.model,
    });

    return { requestId, ...result };
  },
});
