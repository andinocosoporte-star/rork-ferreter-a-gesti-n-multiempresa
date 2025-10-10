import { publicProcedure } from "../../../create-context";
import { supabase } from "../../../../db/supabase";
import { z } from "zod";

export const getCustomersProcedure = publicProcedure
  .input(
    z.object({
      companyId: z.string(),
      branchId: z.string(),
      search: z.string().optional(),
    })
  )
  .query(async ({ input }) => {
    console.log("[getCustomers] Input:", input);

    let query = supabase
      .from("customers")
      .select("*")
      .eq("company_id", input.companyId)
      .eq("branch_id", input.branchId);

    if (input.search) {
      const searchLower = input.search.toLowerCase();
      query = query.or(
        `name.ilike.%${searchLower}%,code.ilike.%${searchLower}%,email.ilike.%${searchLower}%,phone.ilike.%${searchLower}%`
      );
    }

    const { data: customers, error } = await query;

    if (error) {
      console.error("[getCustomers] Error:", error);
      throw new Error("Error al obtener clientes");
    }

    const customersWithCredit = await Promise.all(
      (customers || []).map(async (customer) => {
        const { data: transactions } = await supabase
          .from("credit_transactions")
          .select("*")
          .eq("customer_id", customer.id)
          .order("created_at", { ascending: false });

        const currentDebt = transactions && transactions.length > 0 
          ? transactions[0].balance 
          : 0;

        const available = customer.credit_limit - currentDebt;

        return {
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
          currentDebt,
          available,
          creditCount: transactions?.filter((t) => t.type === "sale").length || 0,
        };
      })
    );

    console.log("[getCustomers] Found customers:", customersWithCredit.length);

    return customersWithCredit;
  });
