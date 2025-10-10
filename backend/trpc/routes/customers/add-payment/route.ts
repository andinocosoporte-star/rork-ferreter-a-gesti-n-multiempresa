import { publicProcedure } from "../../../create-context";
import { supabase } from "../../../../db/supabase";
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
  .mutation(async ({ input }) => {
    console.log("[addPayment] Input:", input);

    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .select("id")
      .eq("id", input.customerId)
      .single();

    if (customerError || !customer) {
      throw new Error("Cliente no encontrado");
    }

    const { data: transactions } = await supabase
      .from("credit_transactions")
      .select("*")
      .eq("customer_id", input.customerId)
      .order("created_at", { ascending: false })
      .limit(1);

    const currentBalance = transactions && transactions.length > 0 
      ? transactions[0].balance 
      : 0;

    if (input.amount > currentBalance) {
      throw new Error("El monto del abono no puede ser mayor a la deuda actual");
    }

    const newBalance = currentBalance - input.amount;

    const { data: transaction, error } = await supabase
      .from("credit_transactions")
      .insert({
        customer_id: input.customerId,
        type: "payment",
        amount: input.amount,
        balance: newBalance,
        description: input.description,
        date: new Date().toISOString(),
        company_id: input.companyId,
        branch_id: input.branchId,
        created_by: input.createdBy,
      })
      .select()
      .single();

    if (error || !transaction) {
      console.error("[addPayment] Error:", error);
      throw new Error("Error al registrar el pago");
    }

    console.log("[addPayment] Payment added:", transaction.id);

    return {
      id: transaction.id,
      customerId: transaction.customer_id,
      type: transaction.type,
      saleId: transaction.sale_id,
      amount: transaction.amount,
      balance: transaction.balance,
      description: transaction.description,
      date: new Date(transaction.date),
      companyId: transaction.company_id,
      branchId: transaction.branch_id,
      createdBy: transaction.created_by,
      createdAt: new Date(transaction.created_at),
    };
  });
