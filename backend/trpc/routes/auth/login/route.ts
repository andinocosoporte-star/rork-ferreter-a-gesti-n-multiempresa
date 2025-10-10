import { publicProcedure } from "../../../create-context";
import { supabase } from "../../../../db/supabase";
import { z } from "zod";

export const loginProcedure = publicProcedure
  .input(
    z.object({
      email: z.string().email(),
      password: z.string().min(1),
    })
  )
  .mutation(async ({ input }) => {
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("email", input.email)
      .eq("password", input.password)
      .eq("is_active", true)
      .single();

    if (userError || !user) {
      throw new Error("Credenciales inválidas");
    }

    const token = `token_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const { error: sessionError } = await supabase
      .from("auth_sessions")
      .insert({
        user_id: user.id,
        token,
        expires_at: expiresAt.toISOString(),
      });

    if (sessionError) {
      throw new Error("Error al crear la sesión");
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
      token,
      user: {
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
      },
    };
  });
