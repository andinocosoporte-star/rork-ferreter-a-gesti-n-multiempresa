import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "../../backend/trpc/app-router";
import { createContext } from "../../backend/trpc/create-context";

export const config = { runtime: "edge" };

const endpoint = "/api/trpc";

export default async function handler(req: Request): Promise<Response> {
	// CORS preflight
	if (req.method === "OPTIONS") {
		return new Response(null, {
			status: 204,
			headers: {
				"Access-Control-Allow-Origin": "*",
				"Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
				"Access-Control-Allow-Headers": "Content-Type, Authorization",
			},
		});
	}

	try {
		return await fetchRequestHandler({
			endpoint,
			router: appRouter,
			req,
			createContext,
					onError(opts: { error: unknown; path?: string }) {
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
