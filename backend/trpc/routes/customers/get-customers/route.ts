import { publicProcedure } from "../../../create-context";
import { db } from "../../../../db/schema";
import { z } from "zod";

export const getCustomersProcedure = publicProcedure
  .input(
    z.object({
      companyId: z.string(),
      branchId: z.string(),
      search: z.string().optional(),
    })
  )
  .query(({ input }) => {
    console.log("[getCustomers] Input:", input);

    let customers = db.customers.filter(
      (c) => c.companyId === input.companyId && c.branchId === input.branchId
    );

    if (input.search) {
      const searchLower = input.search.toLowerCase();
      customers = customers.filter(
        (c) =>
          c.name.toLowerCase().includes(searchLower) ||
          c.code.toLowerCase().includes(searchLower) ||
          c.email.toLowerCase().includes(searchLower) ||
          c.phone.includes(searchLower)
      );
    }

    const customersWithCredit = customers.map((customer) => {
      const transactions = db.creditTransactions.filter(
        (t) => t.customerId === customer.id
      );

      const currentDebt = transactions.length > 0 
        ? transactions[transactions.length - 1].balance 
        : 0;

      const available = customer.creditLimit - currentDebt;

      return {
        ...customer,
        currentDebt,
        available,
        creditCount: transactions.filter((t) => t.type === "sale").length,
      };
    });

    console.log("[getCustomers] Found customers:", customersWithCredit.length);

    return customersWithCredit;
  });
