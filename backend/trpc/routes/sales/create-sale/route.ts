import { publicProcedure } from "../../../create-context";
import { db } from "../../../../db/schema";
import { z } from "zod";

const saleItemSchema = z.object({
  productId: z.string(),
  productCode: z.string(),
  productName: z.string(),
  quantity: z.number().positive(),
  unit: z.string(),
  unitPrice: z.number().min(0),
  discount: z.number().min(0).max(100),
  subtotal: z.number(),
});

export default publicProcedure
  .input(
    z.object({
      customerName: z.string(),
      customerDocument: z.string(),
      customerPhone: z.string(),
      customerEmail: z.string(),
      items: z.array(saleItemSchema),
      subtotal: z.number(),
      discount: z.number(),
      tax: z.number(),
      total: z.number(),
      paymentMethod: z.string(),
      notes: z.string(),
      companyId: z.string(),
      branchId: z.string(),
      createdBy: z.string(),
    })
  )
  .mutation(({ input }) => {
    for (const item of input.items) {
      const product = db.products.find((p) => p.id === item.productId);
      
      if (!product) {
        throw new Error(`Producto ${item.productName} no encontrado`);
      }

      if (product.stock < item.quantity) {
        throw new Error(
          `Stock insuficiente para ${item.productName}. Disponible: ${product.stock}, Solicitado: ${item.quantity}`
        );
      }
    }

    const saleNumber = `V-${Date.now()}`;
    
    const sale = {
      id: `sale_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      saleNumber,
      date: new Date(),
      ...input,
      status: 'completed' as const,
      createdAt: new Date(),
    };

    for (const item of input.items) {
      const product = db.products.find((p) => p.id === item.productId);
      if (product) {
        product.stock -= item.quantity;
        product.updatedAt = new Date();
      }
    }

    db.sales.push(sale);
    return sale;
  });
