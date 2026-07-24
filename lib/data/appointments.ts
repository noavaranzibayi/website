import { prisma } from "@/lib/prisma";
import type { Prisma, AppointmentStatus } from "@/app/generated/prisma/client";

export type AppointmentsQuery = {
  q?: string;
  status?: AppointmentStatus;
  assignedAdminId?: string;
  userId?: string;
  page?: number;
  pageSize?: number;
};

export async function queryAppointments({
  q,
  status,
  assignedAdminId,
  userId,
  page = 1,
  pageSize = 10,
}: AppointmentsQuery) {
  const where: Prisma.AppointmentWhereInput = {
    ...(status ? { status } : {}),
    ...(assignedAdminId ? { assignedAdminId } : {}),
    ...(userId ? { userId } : {}),
    ...(q
      ? {
          OR: [
            { subject: { contains: q, mode: "insensitive" } },
            { contactPhone: { contains: q, mode: "insensitive" } },
            { contactEmail: { contains: q, mode: "insensitive" } },
            { user: { name: { contains: q, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.appointment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
        assignedAdmin: { select: { id: true, name: true } },
      },
    }),
    prisma.appointment.count({ where }),
  ]);

  return { items, total, page, pageSize, pageCount: Math.max(1, Math.ceil(total / pageSize)) };
}

export async function getAppointmentById(id: string) {
  return prisma.appointment.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true, image: true } },
      assignedAdmin: { select: { id: true, name: true } },
      history: {
        orderBy: { createdAt: "desc" },
        include: { changedBy: { select: { name: true } } },
      },
    },
  });
}

export async function findConflictingAppointment(params: {
  assignedAdminId: string;
  start: Date;
  durationMin: number;
  excludeId?: string;
}) {
  const end = new Date(params.start.getTime() + params.durationMin * 60_000);

  const candidates = await prisma.appointment.findMany({
    where: {
      assignedAdminId: params.assignedAdminId,
      status: "CONFIRMED",
      ...(params.excludeId ? { id: { not: params.excludeId } } : {}),
      confirmedDate: {
        gte: new Date(params.start.getTime() - 12 * 60 * 60_000),
        lte: new Date(end.getTime() + 12 * 60 * 60_000),
      },
    },
    select: { id: true, subject: true, confirmedDate: true, confirmedDurationMin: true },
  });

  return candidates.find((c) => {
    if (!c.confirmedDate) return false;
    const cStart = c.confirmedDate.getTime();
    const cEnd = cStart + (c.confirmedDurationMin ?? 30) * 60_000;
    return cStart < end.getTime() && cEnd > params.start.getTime();
  });
}

export async function getMonthAppointmentCounts(year: number, monthIndex0: number) {
  const start = new Date(year, monthIndex0, 1);
  const end = new Date(year, monthIndex0 + 1, 1);

  const appointments = await prisma.appointment.findMany({
    where: {
      OR: [
        { confirmedDate: { gte: start, lt: end } },
        { confirmedDate: null, requestedDate: { gte: start, lt: end } },
      ],
    },
    select: { confirmedDate: true, requestedDate: true },
  });

  const counts = new Map<string, number>();
  for (const a of appointments) {
    const date = a.confirmedDate ?? a.requestedDate;
    const key = date.toISOString().slice(0, 10);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}

export async function getAdminOptions() {
  return prisma.user.findMany({
    where: { role: { in: ["ADMIN", "SUPER_ADMIN"] }, status: "ACTIVE" },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}
