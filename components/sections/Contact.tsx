import { Phone, MapPin, Mail } from "lucide-react";
import { getTranslations } from "next-intl/server";
import InstagramIcon from "@/components/icons/InstagramIcon";
import type { ComponentType, SVGProps } from "react";

export default async function Contact() {
  const t = await getTranslations("contact");

  const rows: {
    key: string;
    icon: ComponentType<SVGProps<SVGSVGElement>>;
    value: string;
    href?: string;
    external?: boolean;
  }[] = [
    {
      key: "phone",
      icon: Phone,
      value: t("phoneValue"),
      href: `tel:${t("phoneValue").replace(/[^0-9+]/g, "")}`,
    },
    { key: "address", icon: MapPin, value: t("addressValue") },
    { key: "email", icon: Mail, value: t("emailValue"), href: `mailto:${t("emailValue")}` },
    {
      key: "instagram",
      icon: InstagramIcon,
      value: t("instagramValue"),
      href: `https://instagram.com/${t("instagramValue").replace("@", "")}`,
      external: true,
    },
  ];

  return (
    <section id="contact" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
      <div className="max-w-2xl">
        <span className="text-sm font-bold uppercase tracking-wider text-gold-500">
          {t("quickContact")}
        </span>
        <h2 className="mt-2 text-2xl font-extrabold text-navy-800 dark:text-white sm:text-3xl">
          {t("title")}
        </h2>
        <p className="mt-3 text-navy-600 dark:text-navy-300">{t("subtitle")}</p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {rows.map((row) => {
          const Icon = row.icon;
          const content = (
            <>
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-navy-700 to-navy-900 text-gold-300">
                <Icon className="h-5 w-5" />
              </span>
              <span className="mt-4 text-xs font-medium text-navy-400">{t(row.key)}</span>
              <span className="mt-1 text-base font-bold text-navy-800 dark:text-navy-100" dir="ltr">
                {row.value}
              </span>
            </>
          );

          const className =
            "flex flex-col items-start rounded-2xl border border-navy-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg dark:border-navy-800 dark:bg-navy-900";

          return row.href ? (
            <a
              key={row.key}
              href={row.href}
              target={row.external ? "_blank" : undefined}
              rel={row.external ? "noopener noreferrer" : undefined}
              className={className}
            >
              {content}
            </a>
          ) : (
            <div key={row.key} className={className}>
              {content}
            </div>
          );
        })}
      </div>
    </section>
  );
}
