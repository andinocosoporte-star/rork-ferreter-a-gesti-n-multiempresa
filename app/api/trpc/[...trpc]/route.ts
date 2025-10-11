import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "../../../../backend/trpc/app-router";
import { createContext } from "../../../../backend/trpc/create-context";

export const runtime = "edge";

const endpoint = "/api/trpc";

const handler = async (req: Request): Promise<Response> => {
  try {
    return await fetchRequestHandler({
      endpoint,
      router: appRouter,
      req,
      createContext,
      onError({ error, path }) {
        console.error(`[tRPC] Error on ${path}:`, error);
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
};

export const GET = handler;
export const POST = handler;
export const OPTIONS = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
};
