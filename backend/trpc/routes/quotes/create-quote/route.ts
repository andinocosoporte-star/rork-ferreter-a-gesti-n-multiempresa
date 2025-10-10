import { publicProcedure } from "../../../create-context";
import { supabase } from "../../../../db/supabase";
import { z } from "zod";

async function getNextQuoteNumber(companyId: string, branchId: string): Promise<string> {
  const { data: quotes } = await supabase
    .from("quotes")
    .select("quote_number")
    .eq("company_id", companyId)
    .eq("branch_id", branchId);

  if (!quotes || quotes.length === 0) {
    return "COT-00000001";
  }

  const numbers = quotes
    .map((q) => q.quote_number)
    .filter((num) => num.startsWith("COT-"))
    .map((num) => {
      const parts = num.split("-");
      if (parts.length === 2) {
        const correlativo = parseInt(parts[1]);
        return isNaN(correlativo) ? 0 : correlativo;
      }
      return 0;
    });

  const maxNumber = Math.max(...numbers, 0);
  return `COT-${String(maxNumber + 1).padStart(8, "0")}`;
}

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
      date: z.date(),
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
  .mutation(async ({ input }) => {
    for (const item of input.items) {
      const { data: product } = await supabase
        .from("products")
        .select("id, name")
        .eq("id", item.productId)
        .single();
      
      if (!product) {
        throw new Error(`Producto ${item.productName} no encontrado`);
      }
    }

    const quoteNumber = await getNextQuoteNumber(input.companyId, input.branchId);
    
    const { data: quote, error } = await supabase
      .from("quotes")
      .insert({
        quote_number: quoteNumber,
        date: input.date.toISOString(),
        valid_until: input.validUntil.toISOString(),
        customer_name: input.customerName,
        customer_document: input.customerDocument,
        customer_phone: input.customerPhone,
        customer_email: input.customerEmail,
        items: input.items,
        subtotal: input.subtotal,
        discount: input.discount,
        tax: input.tax,
        total: input.total,
        status: 'pending',
        notes: input.notes,
        company_id: input.companyId,
        branch_id: input.branchId,
        created_by: input.createdBy,
      })
      .select()
      .single();

    if (error || !quote) {
      console.error('[CREATE QUOTE] Error:', error);
      throw new Error("Error al crear la cotización");
    }

    return {
      id: quote.id,
      quoteNumber: quote.quote_number,
      date: new Date(quote.date),
      validUntil: new Date(quote.valid_until),
      customerName: quote.customer_name,
      customerDocument: quote.customer_document,
      customerPhone: quote.customer_phone,
      customerEmail: quote.customer_email,
      items: quote.items,
      subtotal: quote.subtotal,
      discount: quote.discount,
      tax: quote.tax,
      total: quote.total,
      status: quote.status,
      notes: quote.notes,
      companyId: quote.company_id,
      branchId: quote.branch_id,
      createdBy: quote.created_by,
      createdAt: new Date(quote.created_at),
    };
  });
