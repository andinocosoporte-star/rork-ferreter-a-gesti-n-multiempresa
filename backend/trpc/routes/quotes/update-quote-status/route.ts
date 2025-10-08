import { publicProcedure } from "../../../create-context";
import { db } from "../../../../db/schema";
import { z } from "zod";

export default publicProcedure
  .input(
    z.object({
      id: z.string(),
      status: z.enum(['pending', 'approved', 'rejected', 'expired']),
    })
  )
  .mutation(({ input }) => {
    const quote = db.quotes.find((q) => q.id === input.id);

    if (!quote) {
      throw new Error("Cotización no encontrada");
    }

    quote.status = input.status;
    return quote;
  });
