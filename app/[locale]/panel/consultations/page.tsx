import type { Metadata } from "next";
import { MessageSquareText } from "lucide-react";
import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { requirePageSession } from "@/lib/page-guard";
import { prisma } from "@/lib/prisma";
import Breadcrumb from "@/components/panel/Breadcrumb";
import ConsultationStatusBadge from "@/components/panel/consultations/ConsultationStatusBadge";
import NewConsultationDialog from "@/components/panel/consultations/NewConsultationDialog";
import { EmptyState } from "@/components/ui/state";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "consultations" });
  return { title: t("title") };
}

export default async function ConsultationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  const session = await requirePageSession(locale);
  const t = await getTranslations("consultations");
  const tNav = await getTranslations("panel.nav");
  const tServices = await getTranslations("services");
  const format = await getFormatter();

  const services = tServices.raw("items") as { id: string; title: string }[];
  const serviceMap = new Map(services.map((service) => [service.id, service.title]));

  const threads = await prisma.consultationThread.findMany({
    where: { userId: session.user.id },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
        take: 1,
      },
      _count: { select: { messages: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-4">
      <Breadcrumb items={[{ label: tNav("consultations") }]} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-navy-800 dark:text-white sm:text-2xl">{t("title")}</h1>
          <p className="mt-1 text-sm text-navy-500 dark:text-navy-400">{t("subtitle")}</p>
        </div>
        <NewConsultationDialog services={services} />
      </div>

      <div className="rounded-2xl border border-navy-100 bg-white shadow-sm dark:border-navy-800 dark:bg-navy-900">
        {threads.length === 0 ? (
          <EmptyState
            icon={MessageSquareText}
            title={t("empty.title")}
            description={t("empty.description")}
            action={<NewConsultationDialog services={services} />}
          />
        ) : (
          <ul className="divide-y divide-navy-50 dark:divide-navy-800/60">
            {threads.map((thread) => (
              <li key={thread.id}>
                <Link
                  href={`/panel/consultations/${thread.id}`}
                  className="flex flex-wrap items-center justify-between gap-3 p-4 transition-colors hover:bg-navy-50/40 dark:hover:bg-navy-900/40"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-navy-800 dark:text-white">{thread.subject}</p>
                      {thread.serviceId && (
                        <span className="text-xs text-navy-400">{serviceMap.get(thread.serviceId) ?? thread.serviceId}</span>
                      )}
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-navy-500 dark:text-navy-300">
                      {thread.messages[0]?.body}
                    </p>
                    <p className="mt-2 text-xs text-navy-400">
                      {t("list.updatedAt", {
                        date: format.dateTime(thread.updatedAt, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }),
                        count: thread._count.messages,
                      })}
                    </p>
                  </div>
                  <ConsultationStatusBadge status={thread.status} label={t(`status.${thread.status}`)} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}