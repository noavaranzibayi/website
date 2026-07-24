"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import type { RoleName, UserStatus, AppointmentStatus } from "@/app/generated/prisma/client";

export function RoleBadge({ role }: { role: RoleName }) {
  const t = useTranslations("panel.roleLabels");
  const variant = role === "SUPER_ADMIN" ? "warning" : role === "ADMIN" ? "info" : "neutral";
  return <Badge variant={variant}>{t(role)}</Badge>;
}

export function UserStatusBadge({ status }: { status: UserStatus }) {
  const t = useTranslations("panel.statusLabels");
  const variant =
    status === "ACTIVE"
      ? "success"
      : status === "PENDING_VERIFICATION"
        ? "warning"
        : status === "INACTIVE"
          ? "neutral"
          : "danger";
  return <Badge variant={variant}>{t(status)}</Badge>;
}

export function AppointmentStatusBadge({ status }: { status: AppointmentStatus }) {
  const t = useTranslations("appointments.status");
  const variant =
    status === "CONFIRMED"
      ? "success"
      : status === "PENDING"
        ? "warning"
        : status === "RESCHEDULED"
          ? "info"
          : status === "COMPLETED"
            ? "neutral"
            : "danger";
  return <Badge variant={variant}>{t(status)}</Badge>;
}
