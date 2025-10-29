import { publicProcedure } from "../../../create-context";
import { supabase } from "../../../../db/supabase";
import { z } from "zod";

export const getNextCustomerCodeProcedure = publicProcedure
  .input(
    z.object({
      companyId: z.string(),
      branchId: z.string(),
    })
  )
  .query(async ({ input }) => {
    console.log("[getNextCustomerCode] Input:", input);

    const { data: customers } = await supabase
      .from("customers")
      .select("code")
      .eq("company_id", input.companyId)
      .eq("branch_id", input.branchId);

    if (!customers || customers.length === 0) {
      return "CLI-0001";
    }

    const codes = customers
      .map((c: { code: string }) => c.code)
      .filter((code: string) => code.startsWith("CLI-"))
      .map((code: string) => {
        const num = parseInt(code.split("-")[1]);
        return isNaN(num) ? 0 : num;
      });

    const maxCode = Math.max(...codes, 0);
    const nextCode = `CLI-${String(maxCode + 1).padStart(4, "0")}`;

    console.log("[getNextCustomerCode] Next code:", nextCode);

    return nextCode;
  });
