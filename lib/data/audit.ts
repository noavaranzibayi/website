import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/app/generated/prisma/client";

export async function queryAuditLog({
  q,
  page = 1,
  pageSize = 20,
}: {
  q?: string;
  page?: number;
  pageSize?: number;
}) {
  const where: Prisma.AuditLogWhereInput = q
    ? {
        OR: [
          { action: { contains: q, mode: "insensitive" } },
          { targetType: { contains: q, mode: "insensitive" } },
          { actor: { name: { contains: q, mode: "insensitive" } } },
        ],
      }
    : {};

  const [items, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { actor: { select: { name: true, email: true } } },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return { items, total, page, pageSize, pageCount: Math.max(1, Math.ceil(total / pageSize)) };
}
