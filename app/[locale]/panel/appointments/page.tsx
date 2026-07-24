import type { Metadata } from "next";
import { CalendarClock } from "lucide-react";
import { getTranslations, getFormatter, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { requirePageSession } from "@/lib/page-guard";
import { prisma } from "@/lib/prisma";
import Breadcrumb from "@/components/panel/Breadcrumb";
import { Link } from "@/i18n/navigation";
import { AppointmentStatusBadge } from "@/components/panel/shared/Badges";
import { EmptyState } from "@/components/ui/state";
import NewAppointmentDialog from "@/components/panel/my-appointments/NewAppointmentDialog";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "appointments" });
  return { title: t("myTitle") };
}

export default async function MyAppointmentsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const session = await requirePageSession(locale);

  const t = await getTranslations("appointments");
  const tServices = await getTranslations("services");
  const tNav = await getTranslations("panel.nav");
  const format = await getFormatter();

  const services = tServices.raw("items") as { id: string; title: string }[];

  const appointments = await prisma.appointment.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-4">
      <Breadcrumb items={[{ label: tNav("myAppointments") }]} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-navy-800 dark:text-white sm:text-2xl">{t("myTitle")}</h1>
          <p className="mt-1 text-sm text-navy-500 dark:text-navy-400">{t("mySubtitle")}</p>
        </div>
        <NewAppointmentDialog services={services} defaultEmail={session.user.email} />
      </div>

      <div className="rounded-2xl border border-navy-100 bg-white shadow-sm dark:border-navy-800 dark:bg-navy-900">
        {appointments.length === 0 ? (
          <EmptyState icon={CalendarClock} title={t("empty.title")} description={t("empty.description")} className="py-16" />
        ) : (
          <ul className="divide-y divide-navy-50 dark:divide-navy-800/60">
            {appointments.map((a) => (
              <li key={a.id}>
                <Link
                  href={`/panel/appointments/${a.id}`}
                  className="flex flex-wrap items-center justify-between gap-3 p-4 transition-colors hover:bg-navy-50/40 dark:hover:bg-navy-900/40"
                >
                  <div>
                    <p className="font-semibold text-navy-800 dark:text-white">{a.subject}</p>
                    <p className="text-xs text-navy-400">
                      {format.dateTime(a.confirmedDate ?? a.requestedDate, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <AppointmentStatusBadge status={a.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
