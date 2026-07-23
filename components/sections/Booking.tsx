"use client";

import { useState, type FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CalendarCheck, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

type Status = "idle" | "submitting" | "success" | "error";

export default function Booking({ showHeading = true }: { showHeading?: boolean } = {}) {
  const t = useTranslations("booking");
  const tServices = useTranslations("services");
  const locale = useLocale();
  const [status, setStatus] = useState<Status>("idle");

  const services = tServices.raw("items") as { id: string; title: string }[];

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

  const inputClass =
    "rounded-xl border border-navy-200 bg-navy-50/40 px-3.5 py-2.5 text-navy-900 outline-none transition-colors focus:border-gold-400 focus:bg-white focus:ring-4 focus:ring-gold-100 dark:border-navy-700 dark:bg-navy-900 dark:text-white dark:focus:ring-gold-900/30";

  return (
    <section className="relative overflow-hidden bg-navy-950 py-20 sm:py-28">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      <div className="absolute -top-10 start-1/3 h-72 w-72 rounded-full bg-lime-400/10 blur-3xl" />
      <div className="absolute -bottom-16 end-1/4 h-72 w-72 rounded-full bg-gold-400/10 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div
          className={`grid gap-10 lg:items-center lg:gap-16 ${
            showHeading ? "lg:grid-cols-[0.85fr_1.15fr]" : "mx-auto max-w-xl"
          }`}
        >
          {showHeading && (
            <div className="text-white">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-gold-200 ring-1 ring-white/15">
                <CalendarCheck className="h-4 w-4" />
                {t("subtitle")}
              </span>
              <h2 className="mt-5 text-2xl font-extrabold sm:text-3xl">{t("title")}</h2>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="grid gap-4 rounded-3xl bg-white p-6 shadow-2xl dark:bg-navy-900 sm:p-8"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5 text-sm font-medium text-navy-700 dark:text-navy-200">
                {t("form.name")}
                <input name="name" type="text" required className={inputClass} />
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-medium text-navy-700 dark:text-navy-200">
                {t("form.phone")}
                <input name="phone" type="tel" required dir="ltr" className={inputClass} />
              </label>
            </div>

            <label className="flex flex-col gap-1.5 text-sm font-medium text-navy-700 dark:text-navy-200">
              {t("form.service")}
              <select name="service" defaultValue="" className={inputClass}>
                <option value="" disabled>
                  {t("form.servicePlaceholder")}
                </option>
                {services.map((s) => (
                  <option key={s.id} value={s.title}>
                    {s.title}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1.5 text-sm font-medium text-navy-700 dark:text-navy-200">
              {t("form.message")}
              <textarea name="message" rows={3} className={inputClass} />
            </label>

            <button
              type="submit"
              disabled={status === "submitting"}
              className="mt-2 flex items-center justify-center gap-2 rounded-full bg-gold-400 px-6 py-3 text-sm font-semibold text-navy-900 shadow-md transition-all hover:scale-[1.01] hover:bg-gold-300 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {status === "submitting" && <Loader2 className="h-4 w-4 animate-spin" />}
              {status === "submitting" ? t("form.submitting") : t("form.submit")}
            </button>

            {status === "success" && (
              <p className="flex items-center gap-2 rounded-xl bg-lime-50 px-4 py-3 text-sm font-medium text-lime-700">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                {t("form.success")}
              </p>
            )}
            {status === "error" && (
              <p className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {t("form.error")}
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
