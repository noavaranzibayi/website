import { prisma } from "@/lib/prisma";
import { sendPlainNotificationEmail } from "@/lib/mailer";
import type { NotificationType, Locale } from "@/app/generated/prisma/client";

type CreateNotificationInput = {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  appointmentId?: string | null;
  /** When provided, also emails the notification (best-effort, never throws). */
  email?: { to: string; locale: Locale; ctaLabel?: string; ctaUrl?: string } | null;
};

export async function createNotification({
  userId,
  type,
  title,
  body,
  appointmentId,
  email,
}: CreateNotificationInput) {
  const notification = await prisma.notification.create({
    data: {
      userId,
      type,
      title,
      body,
      appointmentId: appointmentId ?? null,
    },
  });

  if (email) {
    sendPlainNotificationEmail(email.to, email.locale, title, body, email.ctaLabel, email.ctaUrl).catch(
      (error) => console.error("[notifications] email send failed:", error)
    );
  }

  return notification;
}
