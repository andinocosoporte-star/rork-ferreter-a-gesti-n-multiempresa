import { publicProcedure } from "../../../create-context";
import { supabase } from "../../../../db/supabase";
import { z } from "zod";

export const logoutProcedure = publicProcedure
  .input(
    z.object({
      token: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    await supabase
      .from("auth_sessions")
      .delete()
      .eq("token", input.token);

    return { success: true };
  });
