import { publicProcedure } from "../../../create-context";
import { db } from "../../../../db/schema";
import { z } from "zod";

export const getNextCustomerCodeProcedure = publicProcedure
  .input(
    z.object({
      companyId: z.string(),
      branchId: z.string(),
    })
  )
  .query(({ input }) => {
    console.log("[getNextCustomerCode] Input:", input);

    const customers = db.customers.filter(
      (c) => c.companyId === input.companyId && c.branchId === input.branchId
    );

    if (customers.length === 0) {
      return "CLI-0001";
    }

    const codes = customers
      .map((c) => c.code)
      .filter((code) => code.startsWith("CLI-"))
      .map((code) => {
        const num = parseInt(code.split("-")[1]);
        return isNaN(num) ? 0 : num;
      });

    const maxCode = Math.max(...codes, 0);
    const nextCode = `CLI-${String(maxCode + 1).padStart(4, "0")}`;

    console.log("[getNextCustomerCode] Next code:", nextCode);

    return nextCode;
  });
