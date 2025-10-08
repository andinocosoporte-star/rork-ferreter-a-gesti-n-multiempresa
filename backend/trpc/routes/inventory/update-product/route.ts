import { publicProcedure } from "../../../create-context";
import { db } from "../../../../db/schema";
import { z } from "zod";

export default publicProcedure
  .input(
    z.object({
      id: z.string(),
      code: z.string(),
      name: z.string(),
      description: z.string(),
      category: z.string(),
      unit: z.string(),
      stock: z.number(),
      minStock: z.number(),
      cost: z.number(),
      price: z.number(),
    })
  )
  .mutation(({ input }) => {
    const index = db.products.findIndex((p) => p.id === input.id);

    if (index === -1) {
      throw new Error("Producto no encontrado");
    }

    const codeExists = db.products.find(
      (p) => p.code === input.code && p.id !== input.id && p.companyId === db.products[index].companyId
    );

    if (codeExists) {
      throw new Error("Ya existe un producto con este código");
    }

    db.products[index] = {
      ...db.products[index],
      ...input,
      updatedAt: new Date(),
    };

    return db.products[index];
  });
