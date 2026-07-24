import { notFound, redirect } from "next/navigation";
import { Clock, MapPin, Link2, Phone } from "lucide-react";
import { getTranslations, getFormatter, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import Breadcrumb from "@/components/panel/Breadcrumb";
import { AppointmentStatusBadge } from "@/components/panel/shared/Badges";
import HistoryTimeline from "@/components/panel/appointments/HistoryTimeline";
import MyAppointmentActions from "@/components/panel/my-appointments/MyAppointmentActions";

const ACTIVE_STATUSES = ["PENDING", "CONFIRMED", "RESCHEDULED"];

export default async function MyAppointmentDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale as Locale);

  const session = await getSession();
  if (!session || session.user.status !== "ACTIVE") redirect(`/${locale}/login`);

  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: {
      history: { orderBy: { createdAt: "desc" }, include: { changedBy: { select: { name: true } } } },
    },
  });

  if (!appointment || appointment.userId !== session.user.id) notFound();

  const t = await getTranslations("appointments");
  const tNav = await getTranslations("panel.nav");
  const format = await getFormatter();
  const date = appointment.confirmedDate ?? appointment.requestedDate;
  const canAct = ACTIVE_STATUSES.includes(appointment.status);

  return (
    <div className="flex flex-col gap-4">
      <Breadcrumb
        items={[
          { label: tNav("myAppointments"), href: "/panel/appointments" },
          { label: appointment.subject },
        ]}
      />

      <div>
        <h1 className="text-xl font-extrabold text-navy-800 dark:text-white sm:text-2xl">{appointment.subject}</h1>
        <div className="mt-1 flex items-center gap-2">
          <AppointmentStatusBadge status={appointment.status} />
          <span className="text-sm text-navy-400">{t(`type.${appointment.type}`)}</span>
        </div>
      </div>

      {canAct && (
        <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-sm dark:border-navy-800 dark:bg-navy-900">
          <MyAppointmentActions id={appointment.id} />
        </div>
      )}

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
        </dl>
      </div>

      <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-sm dark:border-navy-800 dark:bg-navy-900">
        <HistoryTimeline items={appointment.history} />
      </div>
    </div>
  );
}
