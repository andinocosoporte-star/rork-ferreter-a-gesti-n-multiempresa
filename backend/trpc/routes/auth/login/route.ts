import { publicProcedure } from "../../../create-context";
import { db } from "../../../../db/schema";
import { z } from "zod";

export const loginProcedure = publicProcedure
  .input(
    z.object({
      email: z.string().email(),
      password: z.string().min(1),
    })
  )
  .mutation(async ({ input }) => {
    const user = db.users.find(
      (u) => u.email === input.email && u.password === input.password && u.isActive
    );

    if (!user) {
      throw new Error("Credenciales inválidas");
    }

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

    const role = db.roles.find((r) => r.id === user.roleId);
    const company = db.companies.find((c) => c.id === user.companyId);
    const branch = user.branchId ? db.branches.find((b) => b.id === user.branchId) : undefined;

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        roleId: user.roleId,
        roleName: role?.name || "",
        permissions: role?.permissions || [],
        companyId: user.companyId,
        companyName: company?.name || "",
        branchId: user.branchId,
        branchName: branch?.name,
      },
    };
  });
