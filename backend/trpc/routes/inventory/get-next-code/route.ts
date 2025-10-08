import { publicProcedure } from "../../../create-context";
import { db } from "../../../../db/schema";
import { z } from "zod";

export default publicProcedure
  .input(
    z.object({
      companyId: z.string(),
    })
  )
  .query(({ input }) => {
    const companyProducts = db.products.filter(
      (p) => p.companyId === input.companyId
    );

    if (companyProducts.length === 0) {
      return "MAT-001";
    }

    const matCodes = companyProducts
      .map((p) => p.code)
      .filter((code) => code.startsWith("MAT-"))
      .map((code) => {
        const num = parseInt(code.replace("MAT-", ""), 10);
        return isNaN(num) ? 0 : num;
      });

    const maxNumber = Math.max(...matCodes, 0);
    const nextNumber = maxNumber + 1;
    return `MAT-${nextNumber.toString().padStart(3, "0")}`;
  });
