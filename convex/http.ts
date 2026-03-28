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

    const result = await ctx.runAction(api.workflows.submitPrompt, {
      mode: body.mode,
      pillar: body.pillar,
      sub: body.sub,
      locale: body.locale,
      input: body.input,
      deviceId: body.deviceId,
      model: body.model,
    });

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

export default http;
