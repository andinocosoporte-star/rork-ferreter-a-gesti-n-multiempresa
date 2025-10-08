import { publicProcedure } from "../../../create-context";
import { db } from "../../../../db/schema";
import { z } from "zod";

export default publicProcedure
  .input(
    z.object({
      csvData: z.string(),
      companyId: z.string(),
      branchId: z.string(),
    })
  )
  .mutation(({ input }) => {
    const lines = input.csvData.split("\n").filter((line) => line.trim());

    if (lines.length < 2) {
      throw new Error("El archivo CSV está vacío o no tiene datos");
    }


    const dataLines = lines.slice(1);

    const imported: any[] = [];
    const errors: string[] = [];

    dataLines.forEach((line, index) => {
      try {
        const values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
        const cleanValues = values.map((v) =>
          v.replace(/^"|"$/g, "").replace(/""/g, '"')
        );

        if (cleanValues.length < 10) {
          errors.push(`Línea ${index + 2}: Datos incompletos`);
          return;
        }

        const [
          code,
          name,
          description,
          detailedDescription,
          category,
          unit,
          stock,
          minStock,
          cost,
          price,
        ] = cleanValues;

        if (!code || !name || !category) {
          errors.push(
            `Línea ${index + 2}: Faltan campos obligatorios (código, nombre o categoría)`
          );
          return;
        }

        const existingProduct = db.products.find(
          (p) => p.code === code && p.companyId === input.companyId
        );

        if (existingProduct) {
          errors.push(`Línea ${index + 2}: El código ${code} ya existe`);
          return;
        }

        const product = {
          id: `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          code,
          name,
          description: description || "",
          detailedDescription: detailedDescription || "",
          category,
          unit: unit || "unidad",
          stock: parseFloat(stock) || 0,
          minStock: parseFloat(minStock) || 0,
          cost: parseFloat(cost) || 0,
          price: parseFloat(price) || 0,
          companyId: input.companyId,
          branchId: input.branchId,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        db.products.push(product);
        imported.push(product);
      } catch (error) {
        errors.push(
          `Línea ${index + 2}: Error al procesar - ${error instanceof Error ? error.message : "Error desconocido"}`
        );
      }
    });

    return {
      success: imported.length,
      errors,
      total: dataLines.length,
    };
  });
