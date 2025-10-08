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
    let products = db.products.filter((p) => p.companyId === input.companyId);
    
    if (input.branchId) {
      products = products.filter((p) => p.branchId === input.branchId);
    }
    
    return products;
  });
