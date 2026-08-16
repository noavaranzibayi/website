import type { ReactNode } from "react";
import BrandLockup from "@/components/BrandLockup";

export default function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-navy-100 bg-white p-7 shadow-xl dark:border-navy-800 dark:bg-navy-900 sm:p-9">
      <div className="mb-6 flex flex-col items-center text-center">
        <BrandLockup size="xxl" showSubtitle className="mb-4 dark:hidden" />
        <BrandLockup size="xxl" showSubtitle surface="dark" className="mb-4 hidden dark:inline-flex" />
        <h1 className="text-xl font-extrabold text-navy-800 dark:text-white">{title}</h1>
        {subtitle && <p className="mt-1.5 text-sm text-navy-500 dark:text-navy-400">{subtitle}</p>}
      </div>
      {children}
      {footer && <div className="mt-6 text-center text-sm text-navy-500 dark:text-navy-400">{footer}</div>}
    </div>
  );
}
