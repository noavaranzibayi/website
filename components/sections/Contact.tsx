import { Phone, MapPin, Mail } from "lucide-react";
import { getTranslations } from "next-intl/server";
import InstagramIcon from "@/components/icons/InstagramIcon";
import type { ComponentType, SVGProps } from "react";
import Reveal, { StaggerGroup, StaggerItem } from "@/components/motion/Reveal";
import FloatImage from "@/components/motion/FloatImage";

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
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
      <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-16">
        <div>
          <Reveal>
            <span className="text-sm font-bold uppercase tracking-wider text-gold-500">
              {t("quickContact")}
            </span>
          </Reveal>

          <StaggerGroup className="mt-6 grid gap-4 sm:grid-cols-2">
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

              return (
                <StaggerItem key={row.key}>
                  {row.href ? (
                    <a
                      href={row.href}
                      target={row.external ? "_blank" : undefined}
                      rel={row.external ? "noopener noreferrer" : undefined}
                      className={className}
                    >
                      {content}
                    </a>
                  ) : (
                    <div className={className}>{content}</div>
                  )}
                </StaggerItem>
              );
            })}
          </StaggerGroup>
        </div>

        <FloatImage
          className="relative mx-auto hidden max-w-xs lg:block"
          glowClassName="absolute inset-6 -z-10 rounded-full bg-gradient-to-br from-gold-100 via-white to-lime-100 blur-2xl dark:from-navy-900 dark:via-navy-950 dark:to-navy-900"
          src="/illustrations/contact-helper.png"
          alt={t("quickContact")}
          width={300}
          height={400}
          amplitude={14}
          duration={4.2}
          priority
        />
      </div>
    </section>
  );
}
