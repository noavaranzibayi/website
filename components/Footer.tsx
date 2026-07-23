import Image from "next/image";
import { getTranslations } from "next-intl/server";

export default async function Footer() {
  const t = await getTranslations();

  return (
    <footer className="border-t border-navy-100 bg-navy-950 text-navy-100 dark:border-navy-800">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-10 text-center sm:px-6">
        <div className="flex items-center gap-2">
          <Image
            src="/logo.svg"
            alt="نوآوران زیبایی"
            width={32}
            height={26}
            className="brightness-0 invert"
          />
          <span className="text-base font-bold">نوآوران زیبایی</span>
        </div>
        <p className="max-w-md text-sm text-navy-300">{t("footer.tagline")}</p>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-navy-200">
          <span>{t("contact.phoneValue")}</span>
          <span className="hidden sm:inline">·</span>
          <span>{t("contact.emailValue")}</span>
          <span className="hidden sm:inline">·</span>
          <span>{t("contact.instagramValue")}</span>
        </div>
        <p className="text-xs text-navy-400">{t("footer.rights")}</p>
      </div>
    </footer>
  );
}
