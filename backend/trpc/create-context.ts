import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { initTRPC } from "@trpc/server";
import superjson from "superjson";

// Prevenir uso en cliente; permitir Node y Edge runtimes.
if (typeof window !== "undefined") {
  throw new Error("@trpc/server solo puede usarse en el backend Node.js/Edge, no en el cliente.");
}

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
