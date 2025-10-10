import { publicProcedure } from "../../../create-context";
import { supabase } from "../../../../db/supabase";
import { z } from "zod";

export const registerProcedure = publicProcedure
  .input(
    z.object({
      email: z.string().email(),
      password: z.string().min(6),
      name: z.string().min(1),
      phone: z.string().min(1),
      companyName: z.string().min(1),
      companyLegalName: z.string().min(1),
      companyTaxId: z.string().min(1),
      companyPhone: z.string().min(1),
      companyEmail: z.string().email(),
      companyAddress: z.string().min(1),
      companyCity: z.string().min(1),
      companyCountry: z.string().min(1),
    })
  )
  .mutation(async ({ input }) => {
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", input.email)
      .single();

    if (existingUser) {
      throw new Error("El correo electrónico ya está registrado");
    }

    const { data: company, error: companyError } = await supabase
      .from("companies")
      .insert({
        name: input.companyName,
        legal_name: input.companyLegalName,
        tax_id: input.companyTaxId,
        email: input.companyEmail,
        phone: input.companyPhone,
        address: input.companyAddress,
        city: input.companyCity,
        country: input.companyCountry,
      })
      .select()
      .single();

    if (companyError || !company) {
      throw new Error("Error al crear la empresa");
    }

    const { data: role, error: roleError } = await supabase
      .from("roles")
      .insert({
        name: "Administrador",
        description: "Acceso completo al sistema",
        permissions: ["all"],
        company_id: company.id,
      })
      .select()
      .single();

    if (roleError || !role) {
      throw new Error("Error al crear el rol");
    }

    const { data: branch, error: branchError } = await supabase
      .from("branches")
      .insert({
        company_id: company.id,
        code: "SUC-001",
        name: "Sucursal Principal",
        email: input.companyEmail,
        phone: input.companyPhone,
        address: input.companyAddress,
        city: input.companyCity,
        is_active: true,
      })
      .select()
      .single();

    if (branchError || !branch) {
      throw new Error("Error al crear la sucursal");
    }

    const { data: user, error: userError } = await supabase
      .from("users")
      .insert({
        email: input.email,
        password: input.password,
        name: input.name,
        phone: input.phone,
        role_id: role.id,
        company_id: company.id,
        branch_id: branch.id,
        is_active: true,
      })
      .select()
      .single();

    if (userError || !user) {
      throw new Error("Error al crear el usuario");
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

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        roleId: user.role_id,
        roleName: role.name,
        permissions: role.permissions,
        companyId: user.company_id,
        companyName: company.name,
        branchId: user.branch_id,
        branchName: branch.name,
      },
    };
  });
