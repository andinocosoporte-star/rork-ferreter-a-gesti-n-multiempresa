import { publicProcedure } from "../../../create-context";
import { db } from "../../../../db/schema";
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
    const existingUser = db.users.find((u) => u.email === input.email);
    if (existingUser) {
      throw new Error("El correo electrónico ya está registrado");
    }

    const companyId = `company_${Date.now()}`;
    const roleId = `role_${Date.now()}`;
    const branchId = `branch_${Date.now()}`;
    const userId = `user_${Date.now()}`;

    const company = {
      id: companyId,
      name: input.companyName,
      legalName: input.companyLegalName,
      taxId: input.companyTaxId,
      email: input.companyEmail,
      phone: input.companyPhone,
      address: input.companyAddress,
      city: input.companyCity,
      country: input.companyCountry,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const role = {
      id: roleId,
      name: "Administrador",
      description: "Acceso completo al sistema",
      permissions: ["all"],
      companyId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const branch = {
      id: branchId,
      companyId,
      code: "SUC-001",
      name: "Sucursal Principal",
      email: input.companyEmail,
      phone: input.companyPhone,
      address: input.companyAddress,
      city: input.companyCity,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const user = {
      id: userId,
      email: input.email,
      password: input.password,
      name: input.name,
      phone: input.phone,
      roleId,
      companyId,
      branchId,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    db.companies.push(company);
    db.roles.push(role);
    db.branches.push(branch);
    db.users.push(user);

    const token = `token_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const session = {
      id: `session_${Date.now()}`,
      userId: user.id,
      token,
      expiresAt,
      createdAt: new Date(),
    };

    db.authSessions.push(session);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        roleId: user.roleId,
        roleName: role.name,
        permissions: role.permissions,
        companyId: user.companyId,
        companyName: company.name,
        branchId: user.branchId,
        branchName: branch.name,
      },
    };
  });
