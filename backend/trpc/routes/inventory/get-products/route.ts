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
    console.log('[GET PRODUCTS] Input:', input);
    console.log('[GET PRODUCTS] Total products in DB:', db.products.length);
    
    let products = db.products.filter((p) => p.companyId === input.companyId);
    console.log('[GET PRODUCTS] After company filter:', products.length);
    
    if (input.branchId) {
      products = products.filter((p) => p.branchId === input.branchId);
      console.log('[GET PRODUCTS] After branch filter:', products.length);
    }
    
    console.log('[GET PRODUCTS] Returning products:', products.length);
    return products;
  });
