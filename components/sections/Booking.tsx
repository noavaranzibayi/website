"use client";

import { useState, type FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";

type Status = "idle" | "submitting" | "success" | "error";

export default function Booking() {
  const t = useTranslations("booking");
  const tServices = useTranslations("services");
  const locale = useLocale();
  const [status, setStatus] = useState<Status>("idle");

  const services = tServices.raw("items") as { icon: string; title: string }[];

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");

    const form = new FormData(event.currentTarget);

    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          phone: form.get("phone"),
          service: form.get("service"),
          message: form.get("message"),
          locale,
        }),
      });

      if (!res.ok) throw new Error("request failed");

      setStatus("success");
      event.currentTarget.reset();
    } catch {
      setStatus("error");
    }
  }

  return (
    <section
      id="booking"
      className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24"
    >
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-navy-800 via-navy-700 to-navy-900 shadow-xl">
        <div className="grid gap-8 p-6 sm:p-10 lg:grid-cols-2 lg:gap-12 lg:p-14">
          <div className="text-white">
            <h2 className="text-2xl font-bold sm:text-3xl">{t("title")}</h2>
            <p className="mt-3 max-w-md text-navy-100">{t("subtitle")}</p>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-4 rounded-2xl bg-white p-6 shadow-lg dark:bg-navy-950 sm:p-8">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5 text-sm font-medium text-navy-700 dark:text-navy-200">
                {t("form.name")}
                <input
                  name="name"
                  type="text"
                  required
                  className="rounded-lg border border-navy-200 px-3 py-2 text-navy-900 outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-200 dark:border-navy-700 dark:bg-navy-900 dark:text-white"
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-medium text-navy-700 dark:text-navy-200">
                {t("form.phone")}
                <input
                  name="phone"
                  type="tel"
                  required
                  className="rounded-lg border border-navy-200 px-3 py-2 text-navy-900 outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-200 dark:border-navy-700 dark:bg-navy-900 dark:text-white"
                />
              </label>
            </div>

            <label className="flex flex-col gap-1.5 text-sm font-medium text-navy-700 dark:text-navy-200">
              {t("form.service")}
              <select
                name="service"
                defaultValue=""
                className="rounded-lg border border-navy-200 px-3 py-2 text-navy-900 outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-200 dark:border-navy-700 dark:bg-navy-900 dark:text-white"
              >
                <option value="" disabled>
                  {t("form.servicePlaceholder")}
                </option>
                {services.map((s) => (
                  <option key={s.title} value={s.title}>
                    {s.icon} {s.title}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1.5 text-sm font-medium text-navy-700 dark:text-navy-200">
              {t("form.message")}
              <textarea
                name="message"
                rows={3}
                className="rounded-lg border border-navy-200 px-3 py-2 text-navy-900 outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-200 dark:border-navy-700 dark:bg-navy-900 dark:text-white"
              />
            </label>

            <button
              type="submit"
              disabled={status === "submitting"}
              className="mt-2 rounded-full bg-gold-400 px-6 py-3 text-sm font-semibold text-navy-900 shadow-md transition-colors hover:bg-gold-300 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {status === "submitting" ? t("form.submitting") : t("form.submit")}
            </button>

            {status === "success" && (
              <p className="rounded-lg bg-lime-50 px-4 py-3 text-sm font-medium text-lime-700">
                {t("form.success")}
              </p>
            )}
            {status === "error" && (
              <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {t("form.error")}
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
