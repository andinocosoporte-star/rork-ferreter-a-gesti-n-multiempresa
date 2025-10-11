import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/backend/trpc/app-router";
import { createContext } from "@/backend/trpc/create-context";

export const runtime = "edge";

const endpoint = "/api/rpc";

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

async function handle(req: Request): Promise<Response> {
  try {
    return await fetchRequestHandler({
      endpoint,
      router: appRouter,
      req,
      createContext,
      onError(opts) {
        console.error(`[tRPC] Error on ${opts.path ?? "unknown"}:`, opts.error);
      },
    });
  } catch (err: any) {
    console.error("[Edge] tRPC handler error:", err);
    return new Response(
      JSON.stringify({ error: err?.message || "Internal Server Error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export async function GET(req: Request): Promise<Response> {
  return handle(req);
}

export async function POST(req: Request): Promise<Response> {
  return handle(req);
}