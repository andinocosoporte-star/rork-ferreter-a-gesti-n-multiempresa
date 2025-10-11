import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { cors } from "hono/cors";
import { appRouter } from "../../backend/trpc/app-router";
import { createContext } from "../../backend/trpc/create-context";

export const config = { runtime: "edge" };

const app = new Hono();

// CORS básico
app.use("*", cors({
  origin: "*",
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
  credentials: false,
}));

// Endpoint de salud para probar la función
app.get("/health", (c) => {
  return c.json({ ok: true, path: c.req.path, url: c.req.url });
});

// Montar tRPC bajo cualquier subruta del endpoint actual
app.use(
  "/*",
  trpcServer({
    router: appRouter,
    createContext,
    onError({ error, path }) {
      console.error(`[tRPC] Error on ${path}:`, error);
    },
  })
);

export default app.fetch;
