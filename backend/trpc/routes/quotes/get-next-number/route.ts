import { publicProcedure } from "../../../create-context";
import { supabase } from "../../../../db/supabase";
import { z } from "zod";

export const getNextQuoteNumberProcedure = publicProcedure
  .input(
    z.object({
      companyId: z.string(),
      branchId: z.string(),
    })
  )
  .query(async ({ input }): Promise<string> => {
    console.log("[getNextQuoteNumber] Input:", input);

    const { data: quotes } = await supabase
      .from("quotes")
      .select("quote_number")
      .eq("company_id", input.companyId)
      .eq("branch_id", input.branchId);

    if (!quotes || quotes.length === 0) {
      return "COT-00000001";
    }

    const numbers = quotes
      .map((q: any) => q.quote_number)
      .filter((num: string) => num.startsWith("COT-"))
      .map((num: string) => {
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
