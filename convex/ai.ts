"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";

const DEFAULT_MODEL = "gpt-4o-mini";

export const generateReply = action({
  args: {
    requestId: v.id("requests"),
    system: v.string(),
    prompt: v.string(),
    model: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Use OpenAI directly with optional API key
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      // Fallback: return a demo response when no API key is available
      const demoResponse = `This is a demo response. The AI backend is configured but requires an OPENAI_API_KEY environment variable to be set in Convex for full functionality. Your request was: "${args.prompt.substring(0, 100)}..."`;
      
      await ctx.runMutation(api.requests.completeRequest, {
        requestId: args.requestId,
        response: demoResponse,
        provider: "demo",
      });
      
      return { ok: true, text: demoResponse, demo: true };
    }

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: args.model ?? DEFAULT_MODEL,
          messages: [
            { role: "system", content: args.system },
            { role: "user", content: args.prompt },
          ],
          temperature: 0.4,
        }),
      });

      if (!response.ok) {
        const message = await response.text();
        await ctx.runMutation(api.requests.failRequest, {
          requestId: args.requestId,
          error: message,
        });
        return { ok: false, error: message };
      }

      const body = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const text = body.choices?.[0]?.message?.content?.trim() ?? "";

      await ctx.runMutation(api.requests.completeRequest, {
        requestId: args.requestId,
        response: text,
        provider: "openai",
      });

      return { ok: true, text };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      await ctx.runMutation(api.requests.failRequest, {
        requestId: args.requestId,
        error: errorMessage,
      });
      return { ok: false, error: errorMessage };
    }
  },
});
