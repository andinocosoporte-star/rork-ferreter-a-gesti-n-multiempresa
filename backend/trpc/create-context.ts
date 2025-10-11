import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { initTRPC } from "@trpc/server";
import superjson from "superjson";

// Nota: En algunos entornos (Metro/Expo) los archivos del backend pueden ser
// incluidos accidentalmente en el bundle del cliente. Evitamos lanzar una
// excepción que rompa la UI y, en su lugar, mostramos una advertencia.
// En runtime de servidor/Edge `window` es undefined.
if (typeof window !== "undefined") {
  console.warn(
    "[tRPC] Aviso: @trpc/server no debe ejecutarse en el cliente. Asegúrate de usar lib/trpc para cliente."
  );
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
