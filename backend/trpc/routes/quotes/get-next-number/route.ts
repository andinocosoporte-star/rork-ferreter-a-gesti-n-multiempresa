import { publicProcedure } from "../../../create-context";
import { db } from "../../../../db/schema";
import { z } from "zod";

export const getNextQuoteNumberProcedure = publicProcedure
  .input(
    z.object({
      companyId: z.string(),
      branchId: z.string(),
    })
  )
  .query(({ input }) => {
    console.log("[getNextQuoteNumber] Input:", input);

    const quotes = db.quotes.filter(
      (q) => q.companyId === input.companyId && q.branchId === input.branchId
    );

    if (quotes.length === 0) {
      return "COT-00000001";
    }

    const numbers = quotes
      .map((q) => q.quoteNumber)
      .filter((num) => num.startsWith("COT-"))
      .map((num) => {
        const parts = num.split("-");
        if (parts.length === 2) {
          const correlativo = parseInt(parts[1]);
          return isNaN(correlativo) ? 0 : correlativo;
        }
        return 0;
      });

    const maxNumber = Math.max(...numbers, 0);
    const nextNumber = `COT-${String(maxNumber + 1).padStart(8, "0")}`;

    console.log("[getNextQuoteNumber] Next number:", nextNumber);

    return nextNumber;
  });
