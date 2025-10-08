import { publicProcedure } from "../../../create-context";
import { db } from "../../../../db/schema";
import { z } from "zod";

export default publicProcedure
  .input(
    z.object({
      companyId: z.string(),
      branchId: z.string().optional(),
    })
  )
  .query(({ input }) => {
    let products = db.products.filter((p) => p.companyId === input.companyId);

    if (input.branchId) {
      products = products.filter((p) => p.branchId === input.branchId);
    }

    const csvHeader =
      "Código,Nombre,Descripción,Descripción Detallada,Categoría,Unidad de Medida,Stock,Stock Mínimo,Costo Promedio,Precio Sugerido";
    const csvRows = products.map((p) =>
      [
        p.code,
        p.name,
        p.description,
        p.detailedDescription,
        p.category,
        p.unit,
        p.stock,
        p.minStock,
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
