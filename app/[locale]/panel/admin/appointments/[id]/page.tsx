import { notFound } from "next/navigation";
import { Phone, Mail, MapPin, Link2, Clock } from "lucide-react";
import { getTranslations, getFormatter, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { requirePagePermission } from "@/lib/page-guard";
import { hasPermission } from "@/lib/permissions";
import { getAppointmentById, getAdminOptions } from "@/lib/data/appointments";
import Breadcrumb from "@/components/panel/Breadcrumb";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AppointmentStatusBadge } from "@/components/panel/shared/Badges";
import { Link } from "@/i18n/navigation";
import AppointmentActionsBar from "@/components/panel/appointments/AppointmentActionsBar";
import InternalNotesEditor from "@/components/panel/appointments/InternalNotesEditor";
import HistoryTimeline from "@/components/panel/appointments/HistoryTimeline";

export default async function AppointmentDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale as Locale);
  const session = await requirePagePermission(locale, "APPOINTMENTS", "VIEW");
  const t = await getTranslations("appointments");
  const tNav = await getTranslations("panel.nav");
  const format = await getFormatter();

  const [appointment, admins, canApprove, canEdit] = await Promise.all([
    getAppointmentById(id),
    getAdminOptions(),
    hasPermission(session.user, "APPOINTMENTS", "APPROVE"),
    hasPermission(session.user, "APPOINTMENTS", "EDIT"),
  ]);

  if (!appointment) notFound();

  const date = appointment.confirmedDate ?? appointment.requestedDate;
  const initials = (appointment.user?.name ?? appointment.contactPhone).slice(0, 2).toUpperCase();

  return (
    <div className="flex flex-col gap-4">
      <Breadcrumb
        items={[
          { label: tNav("appointments"), href: "/panel/admin/appointments" },
          { label: appointment.subject },
        ]}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-navy-800 dark:text-white sm:text-2xl">{appointment.subject}</h1>
          <div className="mt-1 flex items-center gap-2">
            <AppointmentStatusBadge status={appointment.status} />
            <span className="text-sm text-navy-400">{t(`type.${appointment.type}`)}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-sm dark:border-navy-800 dark:bg-navy-900">
            <AppointmentActionsBar
              id={appointment.id}
              status={appointment.status}
              assignedAdminId={appointment.assignedAdminId}
              admins={admins}
              canApprove={canApprove}
              canEdit={canEdit}
            />
          </div>

          {appointment.description && (
            <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-sm dark:border-navy-800 dark:bg-navy-900">
              <h3 className="mb-2 text-sm font-bold text-navy-800 dark:text-white">{t("form.description")}</h3>
              <p className="text-sm leading-7 text-navy-600 dark:text-navy-300">{appointment.description}</p>
            </div>
          )}

          <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-sm dark:border-navy-800 dark:bg-navy-900">
            <dl className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-2.5">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-navy-400" />
                <div>
                  <dt className="text-xs text-navy-400">
                    {appointment.confirmedDate ? t("detail.confirmedFor") : t("detail.requestedFor")}
                  </dt>
                  <dd className="text-sm font-semibold text-navy-700 dark:text-navy-200">
                    {format.dateTime(date, { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </dd>
                </div>
              </div>
              {appointment.location && (
                <div className="flex items-start gap-2.5">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-navy-400" />
                  <div>
                    <dt className="text-xs text-navy-400">{t("detail.location")}</dt>
                    <dd className="text-sm font-semibold text-navy-700 dark:text-navy-200">{appointment.location}</dd>
                  </div>
                </div>
              )}
              {appointment.meetingLink && (
                <div className="flex items-start gap-2.5">
                  <Link2 className="mt-0.5 h-4 w-4 shrink-0 text-navy-400" />
                  <div>
                    <dt className="text-xs text-navy-400">{t("detail.meetingLink")}</dt>
                    <dd className="truncate text-sm font-semibold text-navy-700 dark:text-navy-200" dir="ltr">
                      <a href={appointment.meetingLink} target="_blank" rel="noopener noreferrer" className="hover:text-gold-500">
                        {appointment.meetingLink}
                      </a>
                    </dd>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-2.5">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-navy-400" />
                <div>
                  <dt className="text-xs text-navy-400">{t("form.contactPhone")}</dt>
                  <dd className="text-sm font-semibold text-navy-700 dark:text-navy-200" dir="ltr">
                    {appointment.contactPhone}
                  </dd>
                </div>
              </div>
              {appointment.contactEmail && (
                <div className="flex items-start gap-2.5">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-navy-400" />
                  <div>
                    <dt className="text-xs text-navy-400">{t("form.contactEmail")}</dt>
                    <dd className="text-sm font-semibold text-navy-700 dark:text-navy-200" dir="ltr">
                      {appointment.contactEmail}
                    </dd>
                  </div>
                </div>
              )}
            </dl>
          </div>

          {canEdit && (
            <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-sm dark:border-navy-800 dark:bg-navy-900">
              <h3 className="mb-2 text-sm font-bold text-navy-800 dark:text-white">{t("detail.internalNotes")}</h3>
              <InternalNotesEditor id={appointment.id} initialNotes={appointment.internalNotes ?? ""} />
            </div>
          )}

          <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-sm dark:border-navy-800 dark:bg-navy-900">
            <HistoryTimeline items={appointment.history} />
          </div>
        </div>

        <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-sm dark:border-navy-800 dark:bg-navy-900">
          <h3 className="mb-3 text-sm font-bold text-navy-800 dark:text-white">{t("columns.requester")}</h3>
          {appointment.user ? (
            <Link href={`/panel/admin/users/${appointment.user.id}`} className="flex items-center gap-3">
              <Avatar className="h-11 w-11">
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-navy-800 dark:text-white">{appointment.user.name}</p>
                <p className="truncate text-xs text-navy-400" dir="ltr">
                  {appointment.user.email}
                </p>
              </div>
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              <Avatar className="h-11 w-11">
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-bold text-navy-800 dark:text-white" dir="ltr">
                  {appointment.contactPhone}
                </p>
                <p className="text-xs text-navy-400">{t("guest")}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
