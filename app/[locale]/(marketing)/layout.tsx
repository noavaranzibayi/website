import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { Locale } from "@/i18n/routing";

export default async function MarketingLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <Header locale={locale as Locale} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
