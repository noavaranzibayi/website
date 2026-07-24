import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/app/generated/prisma/client";

type LogAuditInput = {
  actorId?: string | null;
  action: string;
  targetType: string;
  targetId?: string | null;
  metadata?: Prisma.InputJsonValue;
  ip?: string | null;
  userAgent?: string | null;
};

export async function logAudit({
  actorId,
  action,
  targetType,
  targetId,
  metadata,
  ip,
  userAgent,
}: LogAuditInput) {
  await prisma.auditLog.create({
    data: {
      actorId: actorId ?? null,
      action,
      targetType,
      targetId: targetId ?? null,
      metadata,
      ip: ip ?? null,
      userAgent: userAgent ?? null,
    },
  });
}
