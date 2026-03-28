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
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      await ctx.runMutation(api.requests.failRequest, {
        requestId: args.requestId,
        error: "OPENAI_API_KEY is not set",
      });
      return { ok: false, error: "OPENAI_API_KEY missing" };
    }

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
  },
});
