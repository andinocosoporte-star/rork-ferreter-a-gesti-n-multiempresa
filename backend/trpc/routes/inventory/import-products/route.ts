import { publicProcedure } from "../../../create-context";
import { supabase } from "../../../../db/supabase";
import { z } from "zod";

export default publicProcedure
  .input(
    z.object({
      csvData: z.string(),
      companyId: z.string(),
      branchId: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    const lines = input.csvData.split("\n").filter((line) => line.trim());

    if (lines.length < 2) {
      throw new Error("El archivo CSV está vacío o no tiene datos");
    }

    const dataLines = lines.slice(1);

    const imported: any[] = [];
    const errors: string[] = [];

    for (let index = 0; index < dataLines.length; index++) {
      const line = dataLines[index];
      try {
        const values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
        const cleanValues = values.map((v) =>
          v.replace(/^"|"$/g, "").replace(/""/g, '"')
        );

        if (cleanValues.length < 10) {
          errors.push(`Línea ${index + 2}: Datos incompletos`);
          continue;
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
          continue;
        }

        const { data: existingProduct } = await supabase
          .from("products")
          .select("id")
          .eq("code", code)
          .eq("company_id", input.companyId)
          .single();

        if (existingProduct) {
          errors.push(`Línea ${index + 2}: El código ${code} ya existe`);
          continue;
        }

        const { data: product, error: insertError } = await supabase
          .from("products")
          .insert({
            code,
            name,
            description: description || "",
            detailed_description: detailedDescription || "",
            category,
            unit: unit || "unidad",
            stock: parseFloat(stock) || 0,
            min_stock: parseFloat(minStock) || 0,
            cost: parseFloat(cost) || 0,
            price: parseFloat(price) || 0,
            company_id: input.companyId,
            branch_id: input.branchId,
          })
          .select()
          .single();

        if (insertError || !product) {
          errors.push(`Línea ${index + 2}: Error al insertar - ${insertError?.message || "Error desconocido"}`);
          continue;
        }

        imported.push(product);
      } catch (error) {
        errors.push(
          `Línea ${index + 2}: Error al procesar - ${error instanceof Error ? error.message : "Error desconocido"}`
        );
      }
    }

    return {
      success: imported.length,
      errors,
      total: dataLines.length,
    };
  });
