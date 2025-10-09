import { publicProcedure } from "../../../create-context";
import { db } from "../../../../db/schema";
import { z } from "zod";

export const logoutProcedure = publicProcedure
  .input(
    z.object({
      token: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    const sessionIndex = db.authSessions.findIndex((s) => s.token === input.token);
    
    if (sessionIndex !== -1) {
      db.authSessions.splice(sessionIndex, 1);
    }

    return { success: true };
  });
