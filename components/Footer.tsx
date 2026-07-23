import Image from "next/image";
import { Phone, MapPin, Mail } from "lucide-react";
import { getTranslations } from "next-intl/server";
import InstagramIcon from "./icons/InstagramIcon";

export default async function Footer() {
  const t = await getTranslations();

  const links = [
    { href: "#about", label: t("nav.about") },
    { href: "#services", label: t("nav.services") },
    { href: "#why-us", label: t("nav.whyUs") },
    { href: "#contact", label: t("nav.contact") },
  ];

  const contactRows = [
    { icon: Phone, value: t("contact.phoneValue") },
    { icon: MapPin, value: t("contact.addressValue") },
    { icon: Mail, value: t("contact.emailValue") },
    { icon: InstagramIcon, value: t("contact.instagramValue") },
  ];

  return (
    <footer className="border-t border-white/5 bg-navy-950 text-navy-100">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 sm:grid-cols-3">
        <div>
          <div className="flex items-center gap-2">
            <Image src="/logo.svg" alt="نوآوران زیبایی" width={32} height={26} className="brightness-0 invert" />
            <span className="text-base font-bold text-white">نوآوران زیبایی</span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-7 text-navy-300">{t("footer.tagline")}</p>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-gold-300">{t("nav.home")}</h3>
          <ul className="mt-4 flex flex-col gap-3 text-sm text-navy-200">
            {links.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="transition-colors hover:text-gold-300">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-gold-300">
            {t("contact.quickContact")}
          </h3>
          <ul className="mt-4 flex flex-col gap-3 text-sm text-navy-200">
            {contactRows.map((row) => (
              <li key={row.value} className="flex items-center gap-2.5" dir="ltr">
                <row.icon className="h-4 w-4 shrink-0 text-gold-300" />
                <span>{row.value}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/5">
        <p className="mx-auto max-w-6xl px-4 py-5 text-center text-xs text-navy-400 sm:px-6">
          {t("footer.rights")}
        </p>
      </div>
    </footer>
  );
}
