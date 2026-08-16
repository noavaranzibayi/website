"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { guardAuthenticated } from "@/lib/actions/guard";
import { createNotification } from "@/lib/notifications";
import { getRequestInfo } from "@/lib/request-info";
import { logAudit } from "@/lib/audit";
import type { ConsultationStatus } from "@/app/generated/prisma/client";

export type ActionResult = { ok: true } | { ok: false; error: string };

const createSchema = z.object({
  subject: z.string().trim().min(2).max(160),
  serviceId: z.string().trim().max(120).optional().or(z.literal("")),
  message: z.string().trim().min(5).max(4000),
});

const replySchema = z.object({
  threadId: z.string().min(1),
  message: z.string().trim().min(2).max(4000),
});

const closeSchema = z.object({
  threadId: z.string().min(1),
});

function adminReplyStatus(isAdminReply: boolean): ConsultationStatus {
  return isAdminReply ? "ANSWERED" : "OPEN";
}

async function notifyAdmins(title: string, body: string) {
  const admins = await prisma.user.findMany({
    where: {
      role: { in: ["ADMIN", "SUPER_ADMIN"] },
      status: "ACTIVE",
    },
    select: { id: true },
  });

  await Promise.all(
    admins.map((admin) =>
      createNotification({
        userId: admin.id,
        type: "SYSTEM",
        title,
        body,
      })
    )
  );
}

async function getThreadForActor(threadId: string, actorId: string, isAdmin: boolean) {
  const thread = await prisma.consultationThread.findUnique({
    where: { id: threadId },
    select: { id: true, userId: true, subject: true, status: true },
  });

  if (!thread) return null;
  if (!isAdmin && thread.userId !== actorId) return null;
  return thread;
}

export async function createConsultationAction(input: unknown): Promise<ActionResult> {
  const guard = await guardAuthenticated();
  if (!guard.ok) return guard;

  const parsed = createSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "INVALID_INPUT" };

  const thread = await prisma.consultationThread.create({
    data: {
      userId: guard.session.user.id,
      subject: parsed.data.subject,
      serviceId: parsed.data.serviceId || null,
      messages: {
        create: {
          senderId: guard.session.user.id,
          body: parsed.data.message,
          isAdminReply: false,
        },
      },
    },
  });

  await notifyAdmins("consultation_created", thread.subject);

  const { ip, userAgent } = await getRequestInfo();
  await logAudit({
    actorId: guard.session.user.id,
    action: "consultation.create",
    targetType: "ConsultationThread",
    targetId: thread.id,
    ip,
    userAgent,
  });

  revalidatePath("/[locale]/panel/consultations", "page");
  revalidatePath("/[locale]/panel/admin/consultations", "page");
  return { ok: true };
}

export async function replyConsultationAction(input: unknown): Promise<ActionResult> {
  const guard = await guardAuthenticated();
  if (!guard.ok) return guard;

  const parsed = replySchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "INVALID_INPUT" };

  const isAdmin = guard.session.user.role !== "USER";
  const thread = await getThreadForActor(parsed.data.threadId, guard.session.user.id, isAdmin);
  if (!thread) return { ok: false, error: "NOT_FOUND" };
  if (thread.status === "CLOSED") return { ok: false, error: "CLOSED" };

  await prisma.$transaction([
    prisma.consultationMessage.create({
      data: {
        threadId: thread.id,
        senderId: guard.session.user.id,
        body: parsed.data.message,
        isAdminReply: isAdmin,
      },
    }),
    prisma.consultationThread.update({
      where: { id: thread.id },
      data: {
        status: adminReplyStatus(isAdmin),
        closedAt: null,
      },
    }),
  ]);

  if (isAdmin) {
    await createNotification({
      userId: thread.userId,
      type: "SYSTEM",
      title: "consultation_answered",
      body: thread.subject,
    });
  } else {
    await notifyAdmins("consultation_replied", thread.subject);
  }

  const { ip, userAgent } = await getRequestInfo();
  await logAudit({
    actorId: guard.session.user.id,
    action: isAdmin ? "consultation.reply_admin" : "consultation.reply_user",
    targetType: "ConsultationThread",
    targetId: thread.id,
    ip,
    userAgent,
  });

  revalidatePath("/[locale]/panel/consultations", "page");
  revalidatePath("/[locale]/panel/consultations/[id]", "page");
  revalidatePath("/[locale]/panel/admin/consultations", "page");
  revalidatePath("/[locale]/panel/admin/consultations/[id]", "page");
  return { ok: true };
}

export async function closeConsultationAction(input: unknown): Promise<ActionResult> {
  const guard = await guardAuthenticated();
  if (!guard.ok) return guard;

  const parsed = closeSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "INVALID_INPUT" };

  const isAdmin = guard.session.user.role !== "USER";
  const thread = await getThreadForActor(parsed.data.threadId, guard.session.user.id, isAdmin);
  if (!thread) return { ok: false, error: "NOT_FOUND" };
  if (thread.status === "CLOSED") return { ok: true };

  await prisma.consultationThread.update({
    where: { id: thread.id },
    data: {
      status: "CLOSED",
      closedAt: new Date(),
    },
  });

  if (isAdmin) {
    await createNotification({
      userId: thread.userId,
      type: "SYSTEM",
      title: "consultation_closed",
      body: thread.subject,
    });
  } else {
    await notifyAdmins("consultation_closed_by_user", thread.subject);
  }

  const { ip, userAgent } = await getRequestInfo();
  await logAudit({
    actorId: guard.session.user.id,
    action: isAdmin ? "consultation.close_admin" : "consultation.close_user",
    targetType: "ConsultationThread",
    targetId: thread.id,
    ip,
    userAgent,
  });

  revalidatePath("/[locale]/panel/consultations", "page");
  revalidatePath("/[locale]/panel/consultations/[id]", "page");
  revalidatePath("/[locale]/panel/admin/consultations", "page");
  revalidatePath("/[locale]/panel/admin/consultations/[id]", "page");
  return { ok: true };
}