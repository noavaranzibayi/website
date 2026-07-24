"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { guardPermission, guardAuthenticated } from "@/lib/actions/guard";
import { logAudit } from "@/lib/audit";
import { getRequestInfo } from "@/lib/request-info";
import { createNotification } from "@/lib/notifications";
import { findConflictingAppointment } from "@/lib/data/appointments";
import { phoneField, emailField } from "@/lib/validation/auth";
import type { AppointmentStatus, AppointmentType } from "@/app/generated/prisma/client";

export type ActionResult = { ok: true } | { ok: false; error: string };

const ACTIVE_STATUSES: AppointmentStatus[] = ["PENDING", "CONFIRMED", "RESCHEDULED"];

async function notifyAssignee(appointmentId: string, title: string, body: string) {
  const appt = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    select: { assignedAdminId: true },
  });
  if (appt?.assignedAdminId) {
    await createNotification({
      userId: appt.assignedAdminId,
      type: "SYSTEM",
      title,
      body,
      appointmentId,
    });
  }
}

async function notifyOwner(
  appointmentId: string,
  type: Parameters<typeof createNotification>[0]["type"],
  title: string,
  body: string
) {
  const appt = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    select: { userId: true, user: { select: { email: true, locale: true } } },
  });
  if (!appt?.userId) return;
  await createNotification({
    userId: appt.userId,
    type,
    title,
    body,
    appointmentId,
    email: appt.user ? { to: appt.user.email, locale: appt.user.locale } : null,
  });
}

const createSchema = z.object({
  subject: z.string().trim().min(2).max(160),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  date: z.string().min(1),
  time: z.string().min(1),
  durationMin: z.coerce.number().int().min(15).max(240).default(30),
  type: z.enum(["IN_PERSON", "ONLINE", "PHONE"]),
  contactPhone: phoneField,
  contactEmail: emailField.optional().or(z.literal("")),
  serviceId: z.string().trim().max(120).optional().or(z.literal("")),
});

export async function createAppointmentAction(input: unknown): Promise<ActionResult> {
  const guard = await guardAuthenticated();
  if (!guard.ok) return guard;

  const parsed = createSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "INVALID_INPUT" };
  const { subject, description, date, time, durationMin, type, contactPhone, contactEmail, serviceId } =
    parsed.data;

  const requestedDate = new Date(`${date}T${time}:00`);
  if (Number.isNaN(requestedDate.getTime())) return { ok: false, error: "INVALID_DATE" };

  const appointment = await prisma.appointment.create({
    data: {
      userId: guard.session.user.id,
      subject,
      description: description || null,
      serviceId: serviceId || null,
      requestedDate,
      requestedDurationMin: durationMin,
      type: type as AppointmentType,
      contactPhone,
      contactEmail: contactEmail || guard.session.user.email,
      status: "PENDING",
      history: { create: { toStatus: "PENDING", changedById: guard.session.user.id } },
    },
  });

  const { ip, userAgent } = await getRequestInfo();
  await logAudit({
    actorId: guard.session.user.id,
    action: "appointment.create",
    targetType: "Appointment",
    targetId: appointment.id,
    ip,
    userAgent,
  });

  revalidatePath("/[locale]/panel/appointments", "page");
  revalidatePath("/[locale]/panel/admin/appointments", "page");
  return { ok: true };
}

const confirmSchema = z.object({
  id: z.string().min(1),
  date: z.string().min(1),
  time: z.string().min(1),
  durationMin: z.coerce.number().int().min(15).max(240).default(30),
  location: z.string().trim().max(300).optional().or(z.literal("")),
  meetingLink: z.string().trim().max(500).optional().or(z.literal("")),
  assignedAdminId: z.string().trim().optional().or(z.literal("")),
});

export async function confirmAppointmentAction(
  input: unknown
): Promise<ActionResult & { conflict?: string }> {
  const guard = await guardPermission("APPOINTMENTS", "APPROVE");
  if (!guard.ok) return guard;

  const parsed = confirmSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "INVALID_INPUT" };
  const { id, date, time, durationMin, location, meetingLink, assignedAdminId } = parsed.data;

  const confirmedDate = new Date(`${date}T${time}:00`);
  if (Number.isNaN(confirmedDate.getTime())) return { ok: false, error: "INVALID_DATE" };

  const resolvedAssignee = assignedAdminId || guard.session.user.id;

  const conflict = await findConflictingAppointment({
    assignedAdminId: resolvedAssignee,
    start: confirmedDate,
    durationMin,
    excludeId: id,
  });
  if (conflict) return { ok: false, error: "CONFLICT", conflict: conflict.subject };

  const existing = await prisma.appointment.findUnique({ where: { id }, select: { status: true } });
  if (!existing) return { ok: false, error: "NOT_FOUND" };

  await prisma.$transaction([
    prisma.appointment.update({
      where: { id },
      data: {
        status: "CONFIRMED",
        confirmedDate,
        confirmedDurationMin: durationMin,
        location: location || null,
        meetingLink: meetingLink || null,
        assignedAdminId: resolvedAssignee,
      },
    }),
    prisma.appointmentHistory.create({
      data: {
        appointmentId: id,
        changedById: guard.session.user.id,
        fromStatus: existing.status,
        toStatus: "CONFIRMED",
      },
    }),
  ]);

  await notifyOwner(id, "APPOINTMENT_CONFIRMED", "appointment_confirmed", "appointment_confirmed_body");

  const { ip, userAgent } = await getRequestInfo();
  await logAudit({
    actorId: guard.session.user.id,
    action: "appointment.confirm",
    targetType: "Appointment",
    targetId: id,
    ip,
    userAgent,
  });

  revalidatePath("/[locale]/panel/admin/appointments/[id]", "page");
  revalidatePath("/[locale]/panel/admin/appointments", "page");
  return { ok: true };
}

const rejectSchema = z.object({
  id: z.string().min(1),
  reason: z.string().trim().min(2).max(500),
});

export async function rejectAppointmentAction(input: unknown): Promise<ActionResult> {
  const guard = await guardPermission("APPOINTMENTS", "APPROVE");
  if (!guard.ok) return guard;

  const parsed = rejectSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "INVALID_INPUT" };
  const { id, reason } = parsed.data;

  const existing = await prisma.appointment.findUnique({ where: { id }, select: { status: true } });
  if (!existing) return { ok: false, error: "NOT_FOUND" };

  await prisma.$transaction([
    prisma.appointment.update({ where: { id }, data: { status: "REJECTED", rejectReason: reason } }),
    prisma.appointmentHistory.create({
      data: { appointmentId: id, changedById: guard.session.user.id, fromStatus: existing.status, toStatus: "REJECTED", note: reason },
    }),
  ]);

  await notifyOwner(id, "APPOINTMENT_REJECTED", "appointment_rejected", reason);

  const { ip, userAgent } = await getRequestInfo();
  await logAudit({ actorId: guard.session.user.id, action: "appointment.reject", targetType: "Appointment", targetId: id, metadata: { reason }, ip, userAgent });

  revalidatePath("/[locale]/panel/admin/appointments/[id]", "page");
  revalidatePath("/[locale]/panel/admin/appointments", "page");
  return { ok: true };
}

const rescheduleSchema = z.object({
  id: z.string().min(1),
  date: z.string().min(1),
  time: z.string().min(1),
  durationMin: z.coerce.number().int().min(15).max(240).default(30),
  note: z.string().trim().max(500).optional().or(z.literal("")),
});

export async function rescheduleAppointmentAction(
  input: unknown
): Promise<ActionResult & { conflict?: string }> {
  const guard = await guardPermission("APPOINTMENTS", "EDIT");
  if (!guard.ok) return guard;

  const parsed = rescheduleSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "INVALID_INPUT" };
  const { id, date, time, durationMin, note } = parsed.data;

  const confirmedDate = new Date(`${date}T${time}:00`);
  if (Number.isNaN(confirmedDate.getTime())) return { ok: false, error: "INVALID_DATE" };

  const existing = await prisma.appointment.findUnique({
    where: { id },
    select: { status: true, assignedAdminId: true },
  });
  if (!existing) return { ok: false, error: "NOT_FOUND" };

  if (existing.assignedAdminId) {
    const conflict = await findConflictingAppointment({
      assignedAdminId: existing.assignedAdminId,
      start: confirmedDate,
      durationMin,
      excludeId: id,
    });
    if (conflict) return { ok: false, error: "CONFLICT", conflict: conflict.subject };
  }

  await prisma.$transaction([
    prisma.appointment.update({
      where: { id },
      data: { status: "RESCHEDULED", confirmedDate, confirmedDurationMin: durationMin },
    }),
    prisma.appointmentHistory.create({
      data: { appointmentId: id, changedById: guard.session.user.id, fromStatus: existing.status, toStatus: "RESCHEDULED", note: note || null },
    }),
  ]);

  await notifyOwner(id, "APPOINTMENT_RESCHEDULED", "appointment_rescheduled", note || "appointment_rescheduled_body");

  const { ip, userAgent } = await getRequestInfo();
  await logAudit({ actorId: guard.session.user.id, action: "appointment.reschedule", targetType: "Appointment", targetId: id, ip, userAgent });

  revalidatePath("/[locale]/panel/admin/appointments/[id]", "page");
  return { ok: true };
}

const assignSchema = z.object({ id: z.string().min(1), assignedAdminId: z.string().min(1) });

export async function assignAppointmentAction(input: unknown): Promise<ActionResult> {
  const guard = await guardPermission("APPOINTMENTS", "MANAGE");
  if (!guard.ok) return guard;

  const parsed = assignSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "INVALID_INPUT" };

  await prisma.appointment.update({
    where: { id: parsed.data.id },
    data: { assignedAdminId: parsed.data.assignedAdminId },
  });

  await notifyAssignee(parsed.data.id, "appointment_assigned", "appointment_assigned_body");

  const { ip, userAgent } = await getRequestInfo();
  await logAudit({ actorId: guard.session.user.id, action: "appointment.assign", targetType: "Appointment", targetId: parsed.data.id, ip, userAgent });

  revalidatePath("/[locale]/panel/admin/appointments/[id]", "page");
  return { ok: true };
}

const notesSchema = z.object({ id: z.string().min(1), internalNotes: z.string().trim().max(4000) });

export async function updateInternalNotesAction(input: unknown): Promise<ActionResult> {
  const guard = await guardPermission("APPOINTMENTS", "EDIT");
  if (!guard.ok) return guard;

  const parsed = notesSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "INVALID_INPUT" };

  await prisma.appointment.update({ where: { id: parsed.data.id }, data: { internalNotes: parsed.data.internalNotes || null } });
  revalidatePath("/[locale]/panel/admin/appointments/[id]", "page");
  return { ok: true };
}

async function simpleStatusTransition(
  id: string,
  toStatus: AppointmentStatus,
  actorId: string,
  auditAction: string
): Promise<ActionResult> {
  const existing = await prisma.appointment.findUnique({ where: { id }, select: { status: true } });
  if (!existing) return { ok: false, error: "NOT_FOUND" };

  await prisma.$transaction([
    prisma.appointment.update({ where: { id }, data: { status: toStatus } }),
    prisma.appointmentHistory.create({
      data: { appointmentId: id, changedById: actorId, fromStatus: existing.status, toStatus },
    }),
  ]);

  const { ip, userAgent } = await getRequestInfo();
  await logAudit({ actorId, action: auditAction, targetType: "Appointment", targetId: id, ip, userAgent });
  revalidatePath("/[locale]/panel/admin/appointments/[id]", "page");
  return { ok: true };
}

export async function completeAppointmentAction(id: string): Promise<ActionResult> {
  const guard = await guardPermission("APPOINTMENTS", "EDIT");
  if (!guard.ok) return guard;
  const result = await simpleStatusTransition(id, "COMPLETED", guard.session.user.id, "appointment.complete");
  if (result.ok) await notifyOwner(id, "APPOINTMENT_COMPLETED", "appointment_completed", "appointment_completed_body");
  return result;
}

export async function markNoShowAction(id: string): Promise<ActionResult> {
  const guard = await guardPermission("APPOINTMENTS", "EDIT");
  if (!guard.ok) return guard;
  return simpleStatusTransition(id, "NO_SHOW", guard.session.user.id, "appointment.no_show");
}

const cancelSchema = z.object({ id: z.string().min(1), reason: z.string().trim().min(2).max(500) });

export async function cancelAppointmentAdminAction(input: unknown): Promise<ActionResult> {
  const guard = await guardPermission("APPOINTMENTS", "EDIT");
  if (!guard.ok) return guard;
  const parsed = cancelSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "INVALID_INPUT" };

  const existing = await prisma.appointment.findUnique({ where: { id: parsed.data.id }, select: { status: true } });
  if (!existing) return { ok: false, error: "NOT_FOUND" };

  await prisma.$transaction([
    prisma.appointment.update({ where: { id: parsed.data.id }, data: { status: "CANCELLED", cancelReason: parsed.data.reason } }),
    prisma.appointmentHistory.create({
      data: { appointmentId: parsed.data.id, changedById: guard.session.user.id, fromStatus: existing.status, toStatus: "CANCELLED", note: parsed.data.reason },
    }),
  ]);

  await notifyOwner(parsed.data.id, "APPOINTMENT_CANCELLED", "appointment_cancelled", parsed.data.reason);

  const { ip, userAgent } = await getRequestInfo();
  await logAudit({ actorId: guard.session.user.id, action: "appointment.cancel", targetType: "Appointment", targetId: parsed.data.id, metadata: { reason: parsed.data.reason }, ip, userAgent });

  revalidatePath("/[locale]/panel/admin/appointments/[id]", "page");
  return { ok: true };
}

// ---- Self-service actions for the owning user ----

const userCancelSchema = z.object({ id: z.string().min(1), reason: z.string().trim().min(2).max(500) });

export async function userCancelAppointmentAction(input: unknown): Promise<ActionResult> {
  const guard = await guardAuthenticated();
  if (!guard.ok) return guard;
  const parsed = userCancelSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "INVALID_INPUT" };

  const appt = await prisma.appointment.findUnique({ where: { id: parsed.data.id } });
  if (!appt || appt.userId !== guard.session.user.id) return { ok: false, error: "FORBIDDEN" };
  if (!ACTIVE_STATUSES.includes(appt.status)) return { ok: false, error: "NOT_CANCELLABLE" };

  await prisma.$transaction([
    prisma.appointment.update({ where: { id: appt.id }, data: { status: "CANCELLED", cancelReason: parsed.data.reason } }),
    prisma.appointmentHistory.create({
      data: { appointmentId: appt.id, changedById: guard.session.user.id, fromStatus: appt.status, toStatus: "CANCELLED", note: parsed.data.reason },
    }),
  ]);

  await notifyAssignee(appt.id, "appointment_cancelled_by_user", parsed.data.reason);

  const { ip, userAgent } = await getRequestInfo();
  await logAudit({ actorId: guard.session.user.id, action: "appointment.user_cancel", targetType: "Appointment", targetId: appt.id, ip, userAgent });

  revalidatePath("/[locale]/panel/appointments/[id]", "page");
  return { ok: true };
}

const userRescheduleRequestSchema = z.object({ id: z.string().min(1), message: z.string().trim().min(2).max(500) });

export async function userRequestRescheduleAction(input: unknown): Promise<ActionResult> {
  const guard = await guardAuthenticated();
  if (!guard.ok) return guard;
  const parsed = userRescheduleRequestSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "INVALID_INPUT" };

  const appt = await prisma.appointment.findUnique({ where: { id: parsed.data.id } });
  if (!appt || appt.userId !== guard.session.user.id) return { ok: false, error: "FORBIDDEN" };
  if (!ACTIVE_STATUSES.includes(appt.status)) return { ok: false, error: "NOT_ELIGIBLE" };

  await prisma.appointmentHistory.create({
    data: {
      appointmentId: appt.id,
      changedById: guard.session.user.id,
      fromStatus: appt.status,
      toStatus: appt.status,
      note: `[reschedule request] ${parsed.data.message}`,
    },
  });

  await notifyAssignee(appt.id, "appointment_reschedule_requested", parsed.data.message);

  const { ip, userAgent } = await getRequestInfo();
  await logAudit({ actorId: guard.session.user.id, action: "appointment.user_reschedule_request", targetType: "Appointment", targetId: appt.id, ip, userAgent });

  revalidatePath("/[locale]/panel/appointments/[id]", "page");
  return { ok: true };
}
