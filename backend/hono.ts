import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { cors } from "hono/cors";
import { appRouter } from "./trpc/app-router";
import { createContext } from "./trpc/create-context";

const app = new Hono();

console.log("[Hono] Starting server...");
console.log("[Hono] SUPABASE_URL:", process.env.SUPABASE_URL ? "✓ Set" : "✗ Missing");
console.log("[Hono] SUPABASE_SERVICE_KEY:", process.env.SUPABASE_SERVICE_KEY ? "✓ Set" : "✗ Missing");

// Use a more conservative CORS configuration. When credentials are enabled,
// Access-Control-Allow-Origin must not be '*'. To avoid accidental leaks in
// production keep credentials disabled unless you explicitly set ALLOWED_ORIGIN.
app.use("*", cors({
  origin: process.env.ALLOWED_ORIGIN || "*",
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
  // Disable credentials by default to avoid sending cookies with '*' origin.
  credentials: false,
}));

app.onError((err, c) => {
  console.error("[Hono] Error:", err);
  return c.json(
    {
      error: {
        message: err.message || "Internal server error",
        code: "INTERNAL_SERVER_ERROR",
      },
    },
    500
  );
});

app.use(
  "/api/trpc/*",
  trpcServer({
    router: appRouter,
    createContext,
    onError({ error, path }) {
      console.error(`[tRPC] Error on ${path}:`, error);
    },
  })
);

app.get("/", (c) => {
  return c.json({ 
    status: "ok", 
    message: "API is running",
    supabase: {
      url: process.env.SUPABASE_URL ? "configured" : "missing",
      serviceKey: process.env.SUPABASE_SERVICE_KEY ? "configured" : "missing"
    }
  });
});

app.notFound((c) => {
  return c.json({ error: "Not found" }, 404);
});

export default app;
