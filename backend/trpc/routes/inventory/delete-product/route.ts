import { publicProcedure } from "../../../create-context";
import { db } from "../../../../db/schema";
import { z } from "zod";

export default publicProcedure
  .input(z.object({ id: z.string() }))
  .mutation(({ input }) => {
    const index = db.products.findIndex((p) => p.id === input.id);

    if (index === -1) {
      throw new Error("Producto no encontrado");
    }

    db.products.splice(index, 1);
    return { success: true };
  });
