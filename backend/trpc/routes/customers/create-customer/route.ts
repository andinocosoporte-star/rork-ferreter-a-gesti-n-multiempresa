import { publicProcedure } from "../../../create-context";
import { db } from "../../../../db/schema";
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
  .mutation(({ input }) => {
    console.log("[createCustomer] Input:", input);

    const existingCode = db.customers.find(
      (c) =>
        c.code === input.code &&
        c.companyId === input.companyId &&
        c.branchId === input.branchId
    );

    if (existingCode) {
      throw new Error("Ya existe un cliente con este código");
    }

    const newCustomer = {
      id: `customer-${Date.now()}-${Math.random()}`,
      code: input.code,
      name: input.name,
      email: input.email,
      phone: input.phone,
      address: input.address,
      creditLimit: input.creditLimit,
      companyId: input.companyId,
      branchId: input.branchId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    db.customers.push(newCustomer);

    console.log("[createCustomer] Customer created:", newCustomer.id);

    return newCustomer;
  });
