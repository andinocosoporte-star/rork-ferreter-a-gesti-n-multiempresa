import { publicProcedure } from "../../../create-context";
import { db } from "../../../../db/schema";
import { z } from "zod";

export const getCurrentUserProcedure = publicProcedure
  .input(
    z.object({
      token: z.string(),
    })
  )
  .query(async ({ input }) => {
    const session = db.authSessions.find(
      (s) => s.token === input.token && s.expiresAt > new Date()
    );

    if (!session) {
      return null;
    }

    const user = db.users.find((u) => u.id === session.userId && u.isActive);

    if (!user) {
      return null;
    }

    const role = db.roles.find((r) => r.id === user.roleId);
    const company = db.companies.find((c) => c.id === user.companyId);
    const branch = user.branchId ? db.branches.find((b) => b.id === user.branchId) : undefined;

    return {
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
    };
  });
