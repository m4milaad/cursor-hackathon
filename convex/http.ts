import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

http.route({
  path: "/ingest",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const body = (await req.json()) as {
      mode?: string;
      pillar?: string;
      sub?: string;
      locale?: string;
      input?: string;
      deviceId?: string;
    };

    if (!body.mode || !body.locale || !body.input) {
      return new Response(
        JSON.stringify({
          error: "mode, locale and input are required",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const requestId = await ctx.runMutation(api.requests.createRequest, {
      mode: body.mode,
      pillar: body.pillar,
      sub: body.sub,
      locale: body.locale,
      input: body.input,
      deviceId: body.deviceId,
    });

    return new Response(
      JSON.stringify({
        ok: true,
        requestId,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  }),
});

http.route({
  path: "/submit",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const body = (await req.json()) as {
      mode?: string;
      pillar?: string;
      sub?: string;
      locale?: string;
      input?: string;
      deviceId?: string;
      model?: string;
    };

    if (!body.mode || !body.locale || !body.input) {
      return new Response(
        JSON.stringify({
          error: "mode, locale and input are required",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Create request first
    const requestId = await ctx.runMutation(api.requests.createRequest, {
      mode: body.mode,
      pillar: body.pillar,
      sub: body.sub,
      locale: body.locale,
      input: body.input,
      deviceId: body.deviceId,
    });

    // Build system prompt based on mode
    let system = "Act as a concise assistant for rural support use-cases.";
    if (body.mode === "samjho") {
      system = "Explain legal or government text in simple language with clear next steps.";
    } else if (body.mode === "zameen") {
      system = "Give practical crop and mandi guidance in concise voice-friendly wording.";
    } else if (body.mode === "taleem") {
      system = "Guide youth with practical education, jobs, and scheme advice.";
    }

    // Generate AI reply
    const result = await ctx.runAction(api.ai.generateReply, {
      requestId,
      system,
      prompt: body.input,
      model: body.model,
    });

    return new Response(JSON.stringify({ requestId, ...result }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

http.route({
  path: "/health",
  method: "GET",
  handler: httpAction(async (ctx) => {
    const health = await ctx.runQuery(api.admin.backendHealth, {});
    return new Response(JSON.stringify(health), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

export default http;
