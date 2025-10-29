import { publicProcedure } from "../../../create-context";
import { supabase } from "../../../../db/supabase";
import { z } from "zod";

export default publicProcedure
  .input(
    z.object({
      companyId: z.string(),
    })
  )
  .query(async ({ input }) => {
    const { data: companyProducts } = await supabase
      .from("products")
      .select("code")
      .eq("company_id", input.companyId);

    if (!companyProducts || companyProducts.length === 0) {
      return "MAT-001";
    }

    const matCodes = companyProducts
      .map((p: { code: string }) => p.code)
      .filter((code: string) => code.startsWith("MAT-"))
      .map((code: string) => {
        const num = parseInt(code.replace("MAT-", ""), 10);
        return isNaN(num) ? 0 : num;
      });

    const maxNumber = Math.max(...matCodes, 0);
    const nextNumber = maxNumber + 1;
    return `MAT-${nextNumber.toString().padStart(3, "0")}`;
  });
