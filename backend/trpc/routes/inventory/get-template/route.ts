import { publicProcedure } from "../../../create-context";

export default publicProcedure.query(() => {
  const csvHeader =
    "Código,Nombre,Descripción,Descripción Detallada,Categoría,Unidad de Medida,Stock,Stock Mínimo,Costo Promedio,Precio Sugerido";
  const csvExample =
    '"MAT-001","Cemento Portland","Construcción","Cemento gris de 50kg","Construcción","saco",150,20,6.20,8.50';

  return {
    csv: [csvHeader, csvExample].join("\n"),
    filename: "plantilla_inventario.csv",
  };
});
