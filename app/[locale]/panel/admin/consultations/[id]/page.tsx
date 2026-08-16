import { notFound, redirect } from "next/navigation";
import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { requirePageSession } from "@/lib/page-guard";
import { prisma } from "@/lib/prisma";
import Breadcrumb from "@/components/panel/Breadcrumb";
import ConsultationReplyPanel from "@/components/panel/consultations/ConsultationReplyPanel";
import ConsultationStatusBadge from "@/components/panel/consultations/ConsultationStatusBadge";

export default async function AdminConsultationDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale as Locale);

  const session = await requirePageSession(locale);
  if (session.user.role === "USER") {
    redirect(`/${locale}/403`);
  }

  const thread = await prisma.consultationThread.findUnique({
    where: { id },
    include: {
      user: {
        select: { id: true, name: true, email: true, phone: true },
      },
      messages: {
        orderBy: { createdAt: "asc" },
        include: { sender: { select: { id: true, name: true } } },
      },
    },
  });

  if (!thread) {
    notFound();
  }

  const t = await getTranslations("consultations");
  const tNav = await getTranslations("panel.nav");
  const tServices = await getTranslations("services");
  const format = await getFormatter();
  const services = tServices.raw("items") as { id: string; title: string }[];
  const serviceLabel = services.find((service) => service.id === thread.serviceId)?.title;

  return (
    <div className="flex flex-col gap-4">
      <Breadcrumb
        items={[
          { label: tNav("consultations"), href: "/panel/admin/consultations" },
          { label: thread.subject },
        ]}
      />

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-navy-800 dark:text-white sm:text-2xl">{thread.subject}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-navy-400">
            <ConsultationStatusBadge status={thread.status} label={t(`status.${thread.status}`)} />
            {serviceLabel && <span>{serviceLabel}</span>}
            <span>
              {t("detail.createdAt", {
                date: format.dateTime(thread.createdAt, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                }),
              })}
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-sm dark:border-navy-800 dark:bg-navy-900">
        <h2 className="mb-4 text-sm font-bold text-navy-800 dark:text-white">{t("detail.customerTitle")}</h2>
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-navy-400">{t("detail.customerName")}</dt>
            <dd className="mt-1 text-sm font-semibold text-navy-700 dark:text-navy-200">{thread.user.name}</dd>
          </div>
          <div>
            <dt className="text-xs text-navy-400">{t("detail.customerEmail")}</dt>
            <dd className="mt-1 text-sm font-semibold text-navy-700 dark:text-navy-200">{thread.user.email}</dd>
          </div>
          {thread.user.phone && (
            <div>
              <dt className="text-xs text-navy-400">{t("detail.customerPhone")}</dt>
              <dd className="mt-1 text-sm font-semibold text-navy-700 dark:text-navy-200">{thread.user.phone}</dd>
            </div>
          )}
        </dl>
      </div>

      <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-sm dark:border-navy-800 dark:bg-navy-900">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-sm font-bold text-navy-800 dark:text-white">{t("detail.timelineTitle")}</h2>
          <span className="text-xs text-navy-400">{thread.messages.length} {t("detail.messagesCount")}</span>
        </div>

        <div className="flex flex-col gap-4">
          {thread.messages.map((message) => {
            const isAdminReply = message.isAdminReply;

            return (
              <div key={message.id} className={`flex ${isAdminReply ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-2xl rounded-2xl px-4 py-3 ${
                    isAdminReply
                      ? "bg-blue-100 text-navy-900 dark:bg-blue-500/25 dark:text-blue-50"
                      : "bg-navy-50 text-navy-700 dark:bg-navy-800 dark:text-navy-100"
                  }`}
                >
                  <div className="mb-1 flex items-center gap-2 text-xs font-semibold">
                    <span>{isAdminReply ? message.sender.name : thread.user.name}</span>
                    <span className="opacity-70">
                      {format.dateTime(message.createdAt, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap text-sm leading-7">{message.body}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <ConsultationReplyPanel threadId={thread.id} isClosed={thread.status === "CLOSED"} />
    </div>
  );
}