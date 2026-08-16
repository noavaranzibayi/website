import { prisma } from "@/lib/prisma";
import type { Prisma, Locale } from "@/app/generated/prisma/client";

export type ServicesQuery = {
  q?: string;
  page?: number;
  pageSize?: number;
};

export async function queryServices({ q, page = 1, pageSize = 10 }: ServicesQuery) {
  const where: Prisma.ServiceWhereInput = q
    ? {
        OR: [
          { slug: { contains: q, mode: "insensitive" } },
          { translations: { some: { title: { contains: q, mode: "insensitive" } } } },
        ],
      }
    : {};

  const [items, total] = await Promise.all([
    prisma.service.findMany({
      where,
      orderBy: { order: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { translations: true },
    }),
    prisma.service.count({ where }),
  ]);

  return { items, total, page, pageSize, pageCount: Math.max(1, Math.ceil(total / pageSize)) };
}

export async function getServiceById(id: string) {
  return prisma.service.findUnique({ where: { id }, include: { translations: true } });
}

export async function getNextServiceOrder() {
  const last = await prisma.service.findFirst({ orderBy: { order: "desc" }, select: { order: true } });
  return (last?.order ?? 0) + 1;
}

export type PublicService = {
  id: string;
  slug: string;
  image: string;
  order: number;
  tag: string;
  title: string;
  description: string;
};

type TranslationLike = { locale: Locale; tag: string; title: string; description: string };

function pickTranslation(translations: TranslationLike[], locale: Locale): TranslationLike {
  return (
    translations.find((t) => t.locale === locale) ??
    translations.find((t) => t.locale === "fa") ??
    translations[0]
  );
}

export async function getActiveServices(locale: Locale): Promise<PublicService[]> {
  const services = await prisma.service.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
    include: { translations: true },
  });

  return services.map((s) => {
    const t = pickTranslation(s.translations, locale);
    return { id: s.id, slug: s.slug, image: s.image, order: s.order, tag: t.tag, title: t.title, description: t.description };
  });
}

export async function getActiveServiceBySlug(slug: string, locale: Locale): Promise<PublicService | null> {
  const s = await prisma.service.findUnique({ where: { slug }, include: { translations: true } });
  if (!s || !s.isActive) return null;
  const t = pickTranslation(s.translations, locale);
  return { id: s.id, slug: s.slug, image: s.image, order: s.order, tag: t.tag, title: t.title, description: t.description };
}
