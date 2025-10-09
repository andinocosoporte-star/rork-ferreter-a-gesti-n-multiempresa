import { publicProcedure } from "../../../create-context";
import { db } from "../../../../db/schema";
import { z } from "zod";

export const getCustomerDetailsProcedure = publicProcedure
  .input(
    z.object({
      customerId: z.string(),
    })
  )
  .query(({ input }) => {
    console.log("[getCustomerDetails] Input:", input);

    const customer = db.customers.find((c) => c.id === input.customerId);

    if (!customer) {
      throw new Error("Cliente no encontrado");
    }

    const transactions = db.creditTransactions
      .filter((t) => t.customerId === input.customerId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const currentDebt = transactions.length > 0 
      ? transactions[0].balance 
      : 0;

    const available = customer.creditLimit - currentDebt;

    const activeCredits = transactions.filter(
      (t) => t.type === "sale" && t.balance > 0
    ).length;

    const paidCredits = transactions.filter(
      (t) => t.type === "sale" && t.balance === 0
    ).length;

    const overdueCredits = 0;

    console.log("[getCustomerDetails] Customer found with", transactions.length, "transactions");

    return {
      customer,
      currentDebt,
      available,
      transactions,
      stats: {
        active: activeCredits,
        paid: paidCredits,
        overdue: overdueCredits,
      },
    };
  });
