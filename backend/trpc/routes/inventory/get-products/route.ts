import { publicProcedure } from "../../../create-context";
import { supabase } from "../../../../db/supabase";
import { z } from "zod";

export default publicProcedure
  .input(
    z.object({
      companyId: z.string(),
      branchId: z.string().optional(),
    })
  )
  .query(async ({ input }) => {
    console.log('[GET PRODUCTS] Input:', input);
    
    let query = supabase
      .from("products")
      .select("*")
      .eq("company_id", input.companyId);
    
    if (input.branchId) {
      query = query.eq("branch_id", input.branchId);
    }
    
    const { data: products, error } = await query;
    
    if (error) {
      console.error('[GET PRODUCTS] Error:', error);
      throw new Error("Error al obtener productos");
    }
    
    console.log('[GET PRODUCTS] Returning products:', products?.length || 0);
    
    return (products || []).map(p => ({
      id: p.id,
      code: p.code,
      name: p.name,
      description: p.description,
      detailedDescription: p.detailed_description,
      category: p.category,
      unit: p.unit,
      stock: p.stock,
      minStock: p.min_stock,
      cost: p.cost,
      price: p.price,
      companyId: p.company_id,
      branchId: p.branch_id,
      createdAt: new Date(p.created_at),
      updatedAt: new Date(p.updated_at),
    }));
  });
