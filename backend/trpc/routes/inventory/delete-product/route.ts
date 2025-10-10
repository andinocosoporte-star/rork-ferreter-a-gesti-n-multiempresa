import { publicProcedure } from "../../../create-context";
import { supabase } from "../../../../db/supabase";
import { z } from "zod";

export default publicProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ input }) => {
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", input.id);

    if (error) {
      throw new Error("Error al eliminar el producto");
    }

    return { success: true };
  });
