import { publicProcedure } from "../../../create-context";
import { supabase } from "../../../../db/supabase";
import { z } from "zod";

export default publicProcedure
  .input(
    z.object({
      id: z.string(),
      status: z.enum(['pending', 'approved', 'rejected', 'expired']),
    })
  )
  .mutation(async ({ input }) => {
    const { data: quote, error } = await supabase
      .from("quotes")
      .update({ status: input.status })
      .eq("id", input.id)
      .select()
      .single();

    if (error || !quote) {
      console.error('[UPDATE QUOTE STATUS] Error:', error);
      throw new Error("Cotización no encontrada");
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
