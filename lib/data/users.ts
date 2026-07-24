import { prisma } from "@/lib/prisma";
import type { Prisma, RoleName, UserStatus } from "@/app/generated/prisma/client";

export type UsersQuery = {
  q?: string;
  role?: RoleName;
  status?: UserStatus;
  page?: number;
  pageSize?: number;
  scope?: "all" | "admins";
};

export async function queryUsers({ q, role, status, page = 1, pageSize = 10, scope = "all" }: UsersQuery) {
  const where: Prisma.UserWhereInput = {
    ...(scope === "admins" ? { role: { in: ["ADMIN", "SUPER_ADMIN"] } } : {}),
    ...(role ? { role } : {}),
    ...(status ? { status } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { phone: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        image: true,
        role: true,
        status: true,
        createdAt: true,
        lastLoginAt: true,
      },
    }),
    prisma.user.count({ where }),
  ]);

  return { items, total, page, pageSize, pageCount: Math.max(1, Math.ceil(total / pageSize)) };
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      image: true,
      role: true,
      status: true,
      locale: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true,
      lastLoginAt: true,
      lastLoginIp: true,
    },
  });
}

export async function countActiveSuperAdmins(excludeUserId?: string) {
  return prisma.user.count({
    where: {
      role: "SUPER_ADMIN",
      ...(excludeUserId ? { id: { not: excludeUserId } } : {}),
    },
  });
}

export async function getUserSessions(userId: string) {
  return prisma.session.findMany({
    where: { userId, expires: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
    select: { id: true, sessionToken: true, ip: true, userAgent: true, createdAt: true, expires: true },
  });
}

export async function getUserAuditLog(userId: string, limit = 20) {
  return prisma.auditLog.findMany({
    where: { OR: [{ actorId: userId }, { targetType: "User", targetId: userId }] },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { actor: { select: { name: true, email: true } } },
  });
}

export async function getUserAppointments(userId: string, limit = 10) {
  return prisma.appointment.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
