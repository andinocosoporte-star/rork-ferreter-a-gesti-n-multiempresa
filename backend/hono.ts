import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { cors } from "hono/cors";
import { appRouter } from "./trpc/app-router";
import { createContext } from "./trpc/create-context";

const app = new Hono();

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
  "/trpc/*",
  trpcServer({
    router: appRouter,
    createContext,
    onError({ error, path }) {
      console.error(`[tRPC] Error on ${path}:`, error);
    },
  })
);

app.get("/", (c) => {
  return c.json({ status: "ok", message: "API is running" });
});

app.notFound((c) => {
  return c.json({ error: "Not found" }, 404);
});

export default app;
