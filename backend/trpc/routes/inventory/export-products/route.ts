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
    let query = supabase
      .from("products")
      .select("*")
      .eq("company_id", input.companyId);

    if (input.branchId) {
      query = query.eq("branch_id", input.branchId);
    }

    const { data: products, error } = await query;

    if (error) {
      console.error('[EXPORT PRODUCTS] Error:', error);
      throw new Error("Error al exportar productos");
    }

    const csvHeader =
      "Código,Nombre,Descripción,Descripción Detallada,Categoría,Unidad de Medida,Stock,Stock Mínimo,Costo Promedio,Precio Sugerido";
    const csvRows = (products || []).map((p) =>
      [
        p.code,
        p.name,
        p.description,
        p.detailed_description,
        p.category,
        p.unit,
        p.stock,
        p.min_stock,
        p.cost,
        p.price,
      ]
        .map((field) => `"${String(field).replace(/"/g, '""')}"`)
        .join(",")
    );

    return {
      csv: [csvHeader, ...csvRows].join("\n"),
      filename: `inventario_${new Date().toISOString().split("T")[0]}.csv`,
    };
  });
