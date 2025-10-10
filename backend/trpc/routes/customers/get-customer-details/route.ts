import { publicProcedure } from "../../../create-context";
import { supabase } from "../../../../db/supabase";
import { z } from "zod";

export const getCustomerDetailsProcedure = publicProcedure
  .input(
    z.object({
      customerId: z.string(),
    })
  )
  .query(async ({ input }) => {
    console.log("[getCustomerDetails] Input:", input);

    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .select("*")
      .eq("id", input.customerId)
      .single();

    if (customerError || !customer) {
      console.error("[getCustomerDetails] Error:", customerError);
      throw new Error("Cliente no encontrado");
    }

    const { data: transactions } = await supabase
      .from("credit_transactions")
      .select("*")
      .eq("customer_id", input.customerId)
      .order("created_at", { ascending: false });

    const currentDebt = transactions && transactions.length > 0 
      ? transactions[0].balance 
      : 0;

    const available = customer.credit_limit - currentDebt;

    const activeCredits = transactions?.filter(
      (t) => t.type === "sale" && t.balance > 0
    ).length || 0;

    const paidCredits = transactions?.filter(
      (t) => t.type === "sale" && t.balance === 0
    ).length || 0;

    const overdueCredits = 0;

    console.log("[getCustomerDetails] Customer found with", transactions?.length || 0, "transactions");

    return {
      customer: {
        id: customer.id,
        code: customer.code,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        creditLimit: customer.credit_limit,
        companyId: customer.company_id,
        branchId: customer.branch_id,
        createdAt: new Date(customer.created_at),
        updatedAt: new Date(customer.updated_at),
      },
      currentDebt,
      available,
      transactions: (transactions || []).map(t => ({
        id: t.id,
        customerId: t.customer_id,
        type: t.type,
        saleId: t.sale_id,
        amount: t.amount,
        balance: t.balance,
        description: t.description,
        date: new Date(t.date),
        companyId: t.company_id,
        branchId: t.branch_id,
        createdBy: t.created_by,
        createdAt: new Date(t.created_at),
      })),
      stats: {
        active: activeCredits,
        paid: paidCredits,
        overdue: overdueCredits,
      },
    };
  });
