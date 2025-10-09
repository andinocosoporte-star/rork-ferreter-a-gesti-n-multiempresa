import { publicProcedure } from "../../../create-context";
import { db } from "../../../../db/schema";
import { z } from "zod";

export const getNextSaleNumberProcedure = publicProcedure
  .input(
    z.object({
      companyId: z.string(),
      branchId: z.string(),
    })
  )
  .query(({ input }) => {
    console.log("[getNextSaleNumber] Input:", input);

    const sales = db.sales.filter(
      (s) => s.companyId === input.companyId && s.branchId === input.branchId
    );

    if (sales.length === 0) {
      return "DTE-01-00000001-00000000-00000001";
    }

    const numbers = sales
      .map((s) => s.saleNumber)
      .filter((num) => num.startsWith("DTE-"))
      .map((num) => {
        const parts = num.split("-");
        if (parts.length === 5) {
          const correlativo = parseInt(parts[4]);
          return isNaN(correlativo) ? 0 : correlativo;
        }
        return 0;
      });

    const maxNumber = Math.max(...numbers, 0);
    const nextNumber = `DTE-01-00000001-00000000-${String(maxNumber + 1).padStart(8, "0")}`;

    console.log("[getNextSaleNumber] Next number:", nextNumber);

    return nextNumber;
  });
