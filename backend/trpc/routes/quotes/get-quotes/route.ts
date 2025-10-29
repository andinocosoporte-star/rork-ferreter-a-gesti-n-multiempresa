import { publicProcedure } from "../../../create-context";
import { supabase } from "../../../../db/supabase";
import { z } from "zod";

export default publicProcedure
  .input(
    z.object({
      companyId: z.string(),
      branchId: z.string().optional(),
    })
  )
  .query(async ({ input }) => {
    let query = supabase
      .from("quotes")
      .select("*")
      .eq("company_id", input.companyId)
      .order("created_at", { ascending: false });
    
    if (input.branchId) {
      query = query.eq("branch_id", input.branchId);
    }
    
    const { data: quotes, error } = await query;
    
    if (error) {
      console.error('[GET QUOTES] Error:', error);
      throw new Error("Error al obtener cotizaciones");
    }
    
    return (quotes || []).map((q: any) => ({
      id: q.id,
      quoteNumber: q.quote_number,
      date: new Date(q.date),
      validUntil: new Date(q.valid_until),
      customerName: q.customer_name,
      customerDocument: q.customer_document,
      customerPhone: q.customer_phone,
      customerEmail: q.customer_email,
      items: q.items,
      subtotal: q.subtotal,
      discount: q.discount,
      tax: q.tax,
      total: q.total,
      status: q.status,
      notes: q.notes,
      companyId: q.company_id,
      branchId: q.branch_id,
      createdBy: q.created_by,
      createdAt: new Date(q.created_at),
    }));
  });
