import { prisma } from "@/lib/prisma";

export async function getDashboardData() {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    activeUsers,
    newUsers,
    totalAdmins,
    pendingAppointments,
    confirmedAppointments,
    cancelledAppointments,
    todayAppointments,
    statusGroups,
    recentUsers,
    recentActivity,
    upcoming,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "USER" } }),
    prisma.user.count({ where: { role: "USER", status: "ACTIVE" } }),
    prisma.user.count({ where: { role: "USER", createdAt: { gte: thirtyDaysAgo } } }),
    prisma.user.count({ where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } } }),
    prisma.appointment.count({ where: { status: "PENDING" } }),
    prisma.appointment.count({ where: { status: "CONFIRMED" } }),
    prisma.appointment.count({ where: { status: "CANCELLED" } }),
    prisma.appointment.count({
      where: {
        OR: [
          { confirmedDate: { gte: startOfToday, lt: endOfToday } },
          { confirmedDate: null, requestedDate: { gte: startOfToday, lt: endOfToday } },
        ],
      },
    }),
    prisma.appointment.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.user.findMany({
      where: { role: "USER", createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true },
    }),
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { actor: { select: { name: true, email: true } } },
    }),
    prisma.appointment.findMany({
      where: { status: "CONFIRMED", confirmedDate: { gte: now } },
      orderBy: { confirmedDate: "asc" },
      take: 5,
      include: { user: { select: { name: true } } },
    }),
  ]);

  const growthBuckets = new Map<string, number>();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    growthBuckets.set(d.toISOString().slice(0, 10), 0);
  }
  for (const u of recentUsers) {
    const key = u.createdAt.toISOString().slice(0, 10);
    if (growthBuckets.has(key)) growthBuckets.set(key, (growthBuckets.get(key) ?? 0) + 1);
  }
  const userGrowth = Array.from(growthBuckets.entries()).map(([date, count]) => ({ date, count }));

  return {
    stats: {
      totalUsers,
      activeUsers,
      newUsers,
      totalAdmins,
      pendingAppointments,
      confirmedAppointments,
      todayAppointments,
      cancelledAppointments,
    },
    userGrowth,
    appointmentStatus: statusGroups.map((g) => ({ status: g.status, count: g._count._all })),
    recentActivity,
    upcoming,
  };
}
