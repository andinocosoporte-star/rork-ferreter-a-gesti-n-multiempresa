import { publicProcedure } from "../../../create-context";
import { supabase } from "../../../../db/supabase";
import { z } from "zod";

export const getCurrentUserProcedure = publicProcedure
  .input(
    z.object({
      token: z.string(),
    })
  )
  .query(async ({ input }) => {
    const { data: session } = await supabase
      .from("auth_sessions")
      .select("*")
      .eq("token", input.token)
      .gt("expires_at", new Date().toISOString())
      .single();

    if (!session) {
      return null;
    }

    const { data: user } = await supabase
      .from("users")
      .select("*")
      .eq("id", session.user_id)
      .eq("is_active", true)
      .single();

    if (!user) {
      return null;
    }

    const { data: role } = await supabase
      .from("roles")
      .select("*")
      .eq("id", user.role_id)
      .single();

    const { data: company } = await supabase
      .from("companies")
      .select("*")
      .eq("id", user.company_id)
      .single();

    let branch = undefined;
    if (user.branch_id) {
      const { data: branchData } = await supabase
        .from("branches")
        .select("*")
        .eq("id", user.branch_id)
        .single();
      branch = branchData;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      roleId: user.role_id,
      roleName: role?.name || "",
      permissions: role?.permissions || [],
      companyId: user.company_id,
      companyName: company?.name || "",
      branchId: user.branch_id,
      branchName: branch?.name,
    };
  });
