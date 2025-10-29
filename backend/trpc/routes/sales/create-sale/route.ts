import { publicProcedure } from "../../../create-context";
import { supabase } from "../../../../db/supabase";
import { z } from "zod";

async function getNextSaleNumber(companyId: string, branchId: string): Promise<string> {
  const { data: sales } = await supabase
    .from("sales")
    .select("sale_number")
    .eq("company_id", companyId)
    .eq("branch_id", branchId);

  if (!sales || sales.length === 0) {
    return "DTE-01-00000001-00000000-00000001";
  }

  const numbers = sales
    .map((s: { sale_number: string }) => s.sale_number)
    .filter((num: string) => num.startsWith("DTE-"))
    .map((num: string) => {
      const parts = num.split("-");
      if (parts.length === 5) {
        const correlativo = parseInt(parts[4]);
        return isNaN(correlativo) ? 0 : correlativo;
      }
      return 0;
    });

  const maxNumber = Math.max(...numbers, 0);
  return `DTE-01-00000001-00000000-${String(maxNumber + 1).padStart(8, "0")}`;
}

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
      date: z.date(),
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
  .mutation(async ({ input }) => {
    for (const item of input.items) {
      const { data: product } = await supabase
        .from("products")
        .select("stock, name")
        .eq("id", item.productId)
        .single();
      
      if (!product) {
        throw new Error(`Producto ${item.productName} no encontrado`);
      }

      if (product.stock < item.quantity) {
        throw new Error(
          `Stock insuficiente para ${item.productName}. Disponible: ${product.stock}, Solicitado: ${item.quantity}`
        );
      }
    }

    const saleNumber = await getNextSaleNumber(input.companyId, input.branchId);
    
    const { data: sale, error: saleError } = await supabase
      .from("sales")
      .insert({
        sale_number: saleNumber,
        date: input.date.toISOString(),
        customer_id: input.customerId || null,
        customer_name: input.customerName,
        customer_document: input.customerDocument,
        customer_phone: input.customerPhone,
        customer_email: input.customerEmail,
        items: input.items,
        subtotal: input.subtotal,
        discount: input.discount,
        tax: input.tax,
        total: input.total,
        payment_method: input.paymentMethod,
        payment_type: input.paymentType,
        status: 'completed',
        notes: input.notes,
        company_id: input.companyId,
        branch_id: input.branchId,
        created_by: input.createdBy,
      })
      .select()
      .single();

    if (saleError || !sale) {
      console.error('[CREATE SALE] Error creating sale:', saleError);
      throw new Error("Error al crear la venta");
    }

    for (const item of input.items) {
      const { data: product } = await supabase
        .from("products")
        .select("stock")
        .eq("id", item.productId)
        .single();

      if (product) {
        await supabase
          .from("products")
          .update({
            stock: product.stock - item.quantity,
            updated_at: new Date().toISOString(),
          })
          .eq("id", item.productId);
      }
    }

    if (input.paymentType === 'credit' && input.customerId) {
      const { data: customer } = await supabase
        .from("customers")
        .select("credit_limit")
        .eq("id", input.customerId)
        .single();
      
      if (customer) {
        const { data: existingTransactions } = await supabase
          .from("credit_transactions")
          .select("balance")
          .eq("customer_id", input.customerId)
          .order("created_at", { ascending: false })
          .limit(1);
        
        const currentBalance = existingTransactions && existingTransactions.length > 0
          ? existingTransactions[0].balance
          : 0;
        
        const newBalance = currentBalance + input.total;
        
        if (newBalance > customer.credit_limit) {
          await supabase.from("sales").delete().eq("id", sale.id);
          
          throw new Error(
            `El crédito excede el límite disponible. Límite: ${customer.credit_limit}, Deuda actual: ${currentBalance}, Nueva deuda: ${newBalance}`
          );
        }
        
        const { error: transactionError } = await supabase
          .from("credit_transactions")
          .insert({
            customer_id: input.customerId,
            type: 'sale',
            sale_id: sale.id,
            amount: input.total,
            balance: newBalance,
            description: `Venta ${saleNumber}`,
            date: new Date().toISOString(),
            company_id: input.companyId,
            branch_id: input.branchId,
            created_by: input.createdBy,
          });
        
        if (transactionError) {
          console.error('[CREATE SALE] Error creating credit transaction:', transactionError);
          await supabase.from("sales").delete().eq("id", sale.id);
          throw new Error("Error al crear la transacción de crédito");
        }
      }
    }

    return {
      id: sale.id,
      saleNumber: sale.sale_number,
      date: new Date(sale.date),
      customerId: sale.customer_id,
      customerName: sale.customer_name,
      customerDocument: sale.customer_document,
      customerPhone: sale.customer_phone,
      customerEmail: sale.customer_email,
      items: sale.items,
      subtotal: sale.subtotal,
      discount: sale.discount,
      tax: sale.tax,
      total: sale.total,
      paymentMethod: sale.payment_method,
      paymentType: sale.payment_type,
      status: sale.status,
      notes: sale.notes,
      companyId: sale.company_id,
      branchId: sale.branch_id,
      createdBy: sale.created_by,
      createdAt: new Date(sale.created_at),
    };
  });
