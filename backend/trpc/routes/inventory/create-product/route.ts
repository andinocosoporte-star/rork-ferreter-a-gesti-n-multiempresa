import { publicProcedure } from "../../../create-context";
import { supabase } from "../../../../db/supabase";
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
  .mutation(async ({ input }) => {
    const { data: existingProduct } = await supabase
      .from("products")
      .select("id")
      .eq("code", input.code)
      .eq("company_id", input.companyId)
      .single();

    if (existingProduct) {
      throw new Error("Ya existe un producto con este código");
    }

    const { data: product, error } = await supabase
      .from("products")
      .insert({
        code: input.code,
        name: input.name,
        description: input.description,
        detailed_description: input.detailedDescription || "",
        category: input.category,
        unit: input.unit,
        stock: input.stock,
        min_stock: input.minStock,
        cost: input.cost,
        price: input.price,
        company_id: input.companyId,
        branch_id: input.branchId,
      })
      .select()
      .single();

    if (error || !product) {
      throw new Error("Error al crear el producto");
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
