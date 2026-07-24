"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function markNotificationReadAction(id: string) {
  const session = await getSession();
  if (!session) return;

  await prisma.notification.updateMany({
    where: { id, userId: session.user.id },
    data: { isRead: true },
  });
  revalidatePath("/[locale]/panel", "layout");
}

export async function markAllNotificationsReadAction() {
  const session = await getSession();
  if (!session) return;

  await prisma.notification.updateMany({
    where: { userId: session.user.id, isRead: false },
    data: { isRead: true },
  });
  revalidatePath("/[locale]/panel", "layout");
}
