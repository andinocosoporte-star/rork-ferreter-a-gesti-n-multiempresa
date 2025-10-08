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
    let sales = db.sales.filter((s) => s.companyId === input.companyId);
    
    if (input.branchId) {
      sales = sales.filter((s) => s.branchId === input.branchId);
    }
    
    return sales.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  });
