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
      .from("sales")
      .select("*")
      .eq("company_id", input.companyId)
      .order("created_at", { ascending: false });
    
    if (input.branchId) {
      query = query.eq("branch_id", input.branchId);
    }
    
    const { data: sales, error } = await query;
    
    if (error) {
      console.error('[GET SALES] Error:', error);
      throw new Error("Error al obtener ventas");
    }
    
    return (sales || []).map((s: any) => ({
      id: s.id,
      saleNumber: s.sale_number,
      date: new Date(s.date),
      customerId: s.customer_id,
      customerName: s.customer_name,
      customerDocument: s.customer_document,
      customerPhone: s.customer_phone,
      customerEmail: s.customer_email,
      items: s.items,
      subtotal: s.subtotal,
      discount: s.discount,
      tax: s.tax,
      total: s.total,
      paymentMethod: s.payment_method,
      paymentType: s.payment_type,
      status: s.status,
      notes: s.notes,
      companyId: s.company_id,
      branchId: s.branch_id,
      createdBy: s.created_by,
      createdAt: new Date(s.created_at),
    }));
  });
