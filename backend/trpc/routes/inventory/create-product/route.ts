import { publicProcedure } from "../../../create-context";
import { db } from "../../../../db/schema";
import { z } from "zod";

export default publicProcedure
  .input(
    z.object({
      code: z.string(),
      name: z.string(),
      description: z.string(),
      detailedDescription: z.string().optional(),
      category: z.string(),
      unit: z.string(),
      stock: z.number(),
      minStock: z.number(),
      cost: z.number(),
      price: z.number(),
      companyId: z.string(),
      branchId: z.string(),
    })
  )
  .mutation(({ input }) => {
    const existingProduct = db.products.find(
      (p) => p.code === input.code && p.companyId === input.companyId
    );

    if (existingProduct) {
      throw new Error("Ya existe un producto con este código");
    }

    const product = {
      id: `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...input,
      detailedDescription: input.detailedDescription || "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    db.products.push(product);
    return product;
  });
