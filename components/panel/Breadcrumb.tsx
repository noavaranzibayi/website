import { ChevronLeft, House } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  const t = await getTranslations("panel.breadcrumb");

  return (
    <nav className="flex flex-wrap items-center gap-1.5 text-sm text-navy-400">
      <Link href="/panel" className="flex items-center gap-1 transition-colors hover:text-gold-500">
        <House className="h-3.5 w-3.5" />
        {t("home")}
      </Link>
      {items.map((item) => (
        <span key={item.label} className="flex items-center gap-1.5">
          <ChevronLeft className="h-3.5 w-3.5 rtl:rotate-0 ltr:rotate-180" />
          {item.href ? (
            <Link href={item.href} className="transition-colors hover:text-gold-500">
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-navy-600 dark:text-navy-300">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
