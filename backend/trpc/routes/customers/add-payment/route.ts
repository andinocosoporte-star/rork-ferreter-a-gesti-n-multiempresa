import { publicProcedure } from "../../../create-context";
import { db } from "../../../../db/schema";
import { z } from "zod";

export const addPaymentProcedure = publicProcedure
  .input(
    z.object({
      customerId: z.string(),
      amount: z.number(),
      description: z.string(),
      companyId: z.string(),
      branchId: z.string(),
      createdBy: z.string(),
    })
  )
  .mutation(({ input }) => {
    console.log("[addPayment] Input:", input);

    const customer = db.customers.find((c) => c.id === input.customerId);

    if (!customer) {
      throw new Error("Cliente no encontrado");
    }

    const transactions = db.creditTransactions.filter(
      (t) => t.customerId === input.customerId
    );

    const currentBalance = transactions.length > 0 
      ? transactions[transactions.length - 1].balance 
      : 0;

    if (input.amount > currentBalance) {
      throw new Error("El monto del abono no puede ser mayor a la deuda actual");
    }

    const newBalance = currentBalance - input.amount;

    const newTransaction = {
      id: `transaction-${Date.now()}-${Math.random()}`,
      customerId: input.customerId,
      type: "payment" as const,
      amount: input.amount,
      balance: newBalance,
      description: input.description,
      date: new Date(),
      companyId: input.companyId,
      branchId: input.branchId,
      createdBy: input.createdBy,
      createdAt: new Date(),
    };

    db.creditTransactions.push(newTransaction);

    console.log("[addPayment] Payment added:", newTransaction.id);

    return newTransaction;
  });
