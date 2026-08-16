import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import BrandLogo from "@/components/BrandLogo";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ThemeSwitcher from "@/components/ThemeSwitcher";

export default async function AuthLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <div className="relative flex min-h-full flex-col bg-navy-50/40 dark:bg-navy-950">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-br from-navy-800 via-navy-700 to-navy-900"
        aria-hidden
      >
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
            backgroundSize: "26px 26px",
          }}
        />
        <div className="absolute -top-16 end-1/4 h-64 w-64 rounded-full bg-gold-400/10 blur-3xl" />
        <div className="absolute -bottom-16 start-1/4 h-64 w-64 rounded-full bg-lime-400/10 blur-3xl" />
      </div>

      <header className="relative mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <Link href="/">
          <BrandLogo alt="نوآوران زیبایی" size="xl" surface="dark" priority />
        </Link>
        <div className="flex items-center gap-2">
          <ThemeSwitcher />
          <LanguageSwitcher locale={locale as Locale} />
        </div>
      </header>

      <main className="relative mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-10 sm:px-6">
        {children}
      </main>
    </div>
  );
}
