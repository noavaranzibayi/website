import { getLocale } from "next-intl/server";
import { getActiveServices } from "@/lib/data/services";
import type { Locale } from "@/app/generated/prisma/client";
import HeroCarousel from "@/components/sections/HeroCarousel";

export default async function Hero() {
  const locale = (await getLocale()) as Locale;
  const services = await getActiveServices(locale);

  const slides = services.map((service) => ({
    id: service.id,
    slug: service.slug,
    tag: service.tag,
    title: service.title,
    subtitle: service.description,
    image: service.image,
  }));

  return <HeroCarousel slides={slides} />;
}
