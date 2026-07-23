import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import "../globals.css";
import { locales, localeDirections, type Locale } from "@/i18n/routing";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const vazirmatn = Vazirmatn({
  subsets: ["arabic", "latin"],
  variable: "--font-body",
  display: "swap",
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });

  const languages = Object.fromEntries(
    locales.map((l) => [l, `/${l}`])
  );

  return {
    metadataBase: new URL("https://noavaranzibayi.com"),
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: `/${locale}`,
      languages,
    },
    manifest: "/manifest.webmanifest",
    icons: {
      icon: [
        { url: "/icons/icon-32x32.png", sizes: "32x32", type: "image/png" },
        { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
        { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
      ],
      apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    },
    openGraph: {
      title: t("title"),
      description: t("description"),
      locale,
      type: "website",
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(locales, locale)) {
    notFound();
  }

  setRequestLocale(locale as Locale);

  const direction = localeDirections[locale as Locale];

  return (
    <html
      lang={locale}
      dir={direction}
      className={`${vazirmatn.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <NextIntlClientProvider>
          <Header locale={locale as Locale} />
          <main className="flex-1">{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
