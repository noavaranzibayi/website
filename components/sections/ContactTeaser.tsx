import { Phone, MapPin, Mail, ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import InstagramIcon from "@/components/icons/InstagramIcon";

export default async function ContactTeaser() {
  const t = await getTranslations();

  const rows = [
    { icon: Phone, value: t("contact.phoneValue") },
    { icon: MapPin, value: t("contact.addressValue") },
    { icon: Mail, value: t("contact.emailValue") },
    { icon: InstagramIcon, value: t("contact.instagramValue") },
  ];

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
      <div className="flex flex-col items-start justify-between gap-8 rounded-3xl border border-navy-100 bg-navy-50/50 p-8 dark:border-navy-800 dark:bg-navy-900/40 lg:flex-row lg:items-center">
        <div>
          <span className="text-sm font-bold uppercase tracking-wider text-gold-500">
            {t("home.contactEyebrow")}
          </span>
          <h2 className="mt-2 text-xl font-extrabold text-navy-800 dark:text-white sm:text-2xl">
            {t("contact.title")}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
          {rows.map((row) => (
            <div key={row.value} className="flex items-center gap-2.5 text-sm font-medium text-navy-700 dark:text-navy-200" dir="ltr">
              <row.icon className="h-4 w-4 shrink-0 text-gold-500" />
              {row.value}
            </div>
          ))}
        </div>

        <Link
          href="/contact"
          className="inline-flex shrink-0 items-center gap-2 rounded-full bg-navy-800 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-700"
        >
          {t("nav.contact")}
          <ArrowLeft className="h-4 w-4 rtl:rotate-0 ltr:rotate-180" />
        </Link>
      </div>
    </section>
  );
}
