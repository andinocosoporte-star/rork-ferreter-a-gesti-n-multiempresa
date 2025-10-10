import { publicProcedure } from "../../../create-context";
import { supabase } from "../../../../db/supabase";
import { z } from "zod";

export const createCustomerProcedure = publicProcedure
  .input(
    z.object({
      code: z.string(),
      name: z.string(),
      email: z.string(),
      phone: z.string(),
      address: z.string(),
      creditLimit: z.number(),
      companyId: z.string(),
      branchId: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    console.log("[createCustomer] Input:", input);

    const { data: existingCode } = await supabase
      .from("customers")
      .select("id")
      .eq("code", input.code)
      .eq("company_id", input.companyId)
      .eq("branch_id", input.branchId)
      .single();

    if (existingCode) {
      throw new Error("Ya existe un cliente con este código");
    }

    const { data: customer, error } = await supabase
      .from("customers")
      .insert({
        code: input.code,
        name: input.name,
        email: input.email,
        phone: input.phone,
        address: input.address,
        credit_limit: input.creditLimit,
        company_id: input.companyId,
        branch_id: input.branchId,
      })
      .select()
      .single();

    if (error || !customer) {
      console.error("[createCustomer] Error:", error);
      throw new Error("Error al crear el cliente");
    }

    console.log("[createCustomer] Customer created:", customer.id);

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
    };
  });
