import { publicProcedure } from "../../../create-context";
import { db } from "../../../../db/schema";
import { z } from "zod";

const quoteItemSchema = z.object({
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
      validUntil: z.date(),
      customerName: z.string(),
      customerDocument: z.string(),
      customerPhone: z.string(),
      customerEmail: z.string(),
      items: z.array(quoteItemSchema),
      subtotal: z.number(),
      discount: z.number(),
      tax: z.number(),
      total: z.number(),
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
    }

    const quoteNumber = `C-${Date.now()}`;
    
    const quote = {
      id: `quote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      quoteNumber,
      date: new Date(),
      ...input,
      status: 'pending' as const,
      createdAt: new Date(),
    };

    db.quotes.push(quote);
    return quote;
  });
