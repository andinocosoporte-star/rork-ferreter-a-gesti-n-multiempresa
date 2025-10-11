
// Solo permitir ejecución en Node.js tradicional
if (typeof window !== "undefined" || process.env.NEXT_RUNTIME === "edge") {
  throw new Error("@trpc/server solo puede usarse en el backend Node.js, no en el cliente ni en Edge Runtime.");
}

import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { initTRPC } from "@trpc/server";
import superjson from "superjson";

export const createContext = async (opts: FetchCreateContextFnOptions) => {
  return {
    req: opts.req,
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    console.error("[tRPC] Error formatter:", error);
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof Error && error.cause.name === "ZodError"
            ? error.cause
            : null,
      },
    };
  },
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
