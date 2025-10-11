import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { cors } from "hono/cors";
import { appRouter } from "../../backend/trpc/app-router";
import { createContext } from "../../backend/trpc/create-context";

const app = new Hono();

// CORS básico
app.use("*", cors({
  origin: "*",
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
  credentials: false,
}));

// Montar tRPC bajo /api/trpc/*
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

export default app.fetch;
