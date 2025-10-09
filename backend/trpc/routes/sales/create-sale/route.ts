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
      customerId: z.string().optional(),
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
      paymentType: z.enum(['cash', 'credit']),
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

    if (input.paymentType === 'credit' && input.customerId) {
      const customer = db.customers.find((c) => c.id === input.customerId);
      
      if (customer) {
        const existingTransactions = db.creditTransactions.filter(
          (t) => t.customerId === input.customerId
        );
        
        const currentBalance = existingTransactions.length > 0
          ? existingTransactions[existingTransactions.length - 1].balance
          : 0;
        
        const newBalance = currentBalance + input.total;
        
        if (newBalance > customer.creditLimit) {
          throw new Error(
            `El crédito excede el límite disponible. Límite: ${customer.creditLimit}, Deuda actual: ${currentBalance}, Nueva deuda: ${newBalance}`
          );
        }
        
        const creditTransaction = {
          id: `transaction-${Date.now()}-${Math.random()}`,
          customerId: input.customerId,
          type: 'sale' as const,
          saleId: sale.id,
          amount: input.total,
          balance: newBalance,
          description: `Venta ${saleNumber}`,
          date: new Date(),
          companyId: input.companyId,
          branchId: input.branchId,
          createdBy: input.createdBy,
          createdAt: new Date(),
        };
        
        db.creditTransactions.push(creditTransaction);
      }
    }

    return sale;
  });
