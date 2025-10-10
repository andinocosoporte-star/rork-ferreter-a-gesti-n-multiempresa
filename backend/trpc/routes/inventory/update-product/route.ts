import { publicProcedure } from "../../../create-context";
import { supabase } from "../../../../db/supabase";
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
  .mutation(async ({ input }) => {
    const { data: existingProduct } = await supabase
      .from("products")
      .select("company_id")
      .eq("id", input.id)
      .single();

    if (!existingProduct) {
      throw new Error("Producto no encontrado");
    }

    const { data: codeExists } = await supabase
      .from("products")
      .select("id")
      .eq("code", input.code)
      .eq("company_id", existingProduct.company_id)
      .neq("id", input.id)
      .single();

    if (codeExists) {
      throw new Error("Ya existe un producto con este código");
    }

    const { data: product, error } = await supabase
      .from("products")
      .update({
        code: input.code,
        name: input.name,
        description: input.description,
        category: input.category,
        unit: input.unit,
        stock: input.stock,
        min_stock: input.minStock,
        cost: input.cost,
        price: input.price,
        updated_at: new Date().toISOString(),
      })
      .eq("id", input.id)
      .select()
      .single();

    if (error || !product) {
      throw new Error("Error al actualizar el producto");
    }

    return {
      id: product.id,
      code: product.code,
      name: product.name,
      description: product.description,
      detailedDescription: product.detailed_description,
      category: product.category,
      unit: product.unit,
      stock: product.stock,
      minStock: product.min_stock,
      cost: product.cost,
      price: product.price,
      companyId: product.company_id,
      branchId: product.branch_id,
      createdAt: new Date(product.created_at),
      updatedAt: new Date(product.updated_at),
    };
  });
