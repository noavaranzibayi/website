"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { guardPermission } from "@/lib/actions/guard";
import { logAudit } from "@/lib/audit";
import { getRequestInfo } from "@/lib/request-info";

export type ActionResult = { ok: true } | { ok: false; error: string };

const slugField = z
  .string()
  .trim()
  .toLowerCase()
  .min(2)
  .max(80)
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "INVALID_SLUG");

const translationSchema = z.object({
  tag: z.string().trim().min(1).max(80),
  title: z.string().trim().min(2).max(200),
  description: z.string().trim().min(2).max(2000),
});

const serviceInputSchema = z.object({
  slug: slugField,
  image: z.string().trim().min(1).max(300),
  order: z.coerce.number().int().min(0).max(9999),
  isActive: z.coerce.boolean(),
  fa: translationSchema,
  en: translationSchema,
  ar: translationSchema,
});

function revalidateServicePaths(slug?: string) {
  revalidatePath("/[locale]/panel/admin/services", "page");
  revalidatePath("/[locale]/(marketing)/services", "page");
  revalidatePath("/[locale]/(marketing)", "page");
  if (slug) revalidatePath("/[locale]/(marketing)/services/[slug]", "page");
}

export async function createServiceAction(input: unknown): Promise<ActionResult> {
  const parsed = serviceInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "INVALID_INPUT" };

  const guard = await guardPermission("SERVICES", "CREATE");
  if (!guard.ok) return guard;

  const { slug, image, order, isActive, fa, en, ar } = parsed.data;

  const existing = await prisma.service.findUnique({ where: { slug } });
  if (existing) return { ok: false, error: "SLUG_TAKEN" };

  const service = await prisma.service.create({
    data: {
      slug,
      image,
      order,
      isActive,
      translations: {
        create: [
          { locale: "fa", ...fa },
          { locale: "en", ...en },
          { locale: "ar", ...ar },
        ],
      },
    },
  });

  const { ip, userAgent } = await getRequestInfo();
  await logAudit({
    actorId: guard.session.user.id,
    action: "service.create",
    targetType: "Service",
    targetId: service.id,
    metadata: { slug },
    ip,
    userAgent,
  });

  revalidateServicePaths(slug);
  return { ok: true };
}

const updateServiceSchema = serviceInputSchema.extend({ id: z.string().min(1) });

export async function updateServiceAction(input: unknown): Promise<ActionResult> {
  const parsed = updateServiceSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "INVALID_INPUT" };

  const guard = await guardPermission("SERVICES", "EDIT");
  if (!guard.ok) return guard;

  const { id, slug, image, order, isActive, fa, en, ar } = parsed.data;

  const target = await prisma.service.findUnique({ where: { id } });
  if (!target) return { ok: false, error: "NOT_FOUND" };

  const slugOwner = await prisma.service.findUnique({ where: { slug } });
  if (slugOwner && slugOwner.id !== id) return { ok: false, error: "SLUG_TAKEN" };

  const translationInputs: Record<"fa" | "en" | "ar", z.infer<typeof translationSchema>> = { fa, en, ar };

  await prisma.$transaction([
    prisma.service.update({ where: { id }, data: { slug, image, order, isActive } }),
    ...(["fa", "en", "ar"] as const).map((locale) =>
      prisma.serviceTranslation.upsert({
        where: { serviceId_locale: { serviceId: id, locale } },
        update: translationInputs[locale],
        create: { serviceId: id, locale, ...translationInputs[locale] },
      })
    ),
  ]);

  const { ip, userAgent } = await getRequestInfo();
  await logAudit({
    actorId: guard.session.user.id,
    action: "service.update",
    targetType: "Service",
    targetId: id,
    ip,
    userAgent,
  });

  revalidateServicePaths(slug);
  if (target.slug !== slug) revalidateServicePaths(target.slug);
  return { ok: true };
}

export async function deleteServiceAction(id: string): Promise<ActionResult> {
  const guard = await guardPermission("SERVICES", "DELETE");
  if (!guard.ok) return guard;

  const target = await prisma.service.findUnique({ where: { id } });
  if (!target) return { ok: false, error: "NOT_FOUND" };

  await prisma.service.delete({ where: { id } });

  const { ip, userAgent } = await getRequestInfo();
  await logAudit({
    actorId: guard.session.user.id,
    action: "service.delete",
    targetType: "Service",
    targetId: id,
    metadata: { slug: target.slug },
    ip,
    userAgent,
  });

  revalidateServicePaths(target.slug);
  return { ok: true };
}
