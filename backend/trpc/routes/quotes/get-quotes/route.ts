import { publicProcedure } from "../../../create-context";
import { db } from "../../../../db/schema";
import { z } from "zod";

export default publicProcedure
  .input(
    z.object({
      companyId: z.string(),
      branchId: z.string().optional(),
    })
  )
  .query(({ input }) => {
    let quotes = db.quotes.filter((q) => q.companyId === input.companyId);
    
    if (input.branchId) {
      quotes = quotes.filter((q) => q.branchId === input.branchId);
    }
    
    return quotes.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  });
