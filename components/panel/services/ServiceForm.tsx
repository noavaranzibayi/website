"use client";

import { useState, useTransition, type FormEvent } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ImageOff } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { createServiceAction, updateServiceAction } from "@/lib/actions/services";
import type { Locale } from "@/app/generated/prisma/client";

type Translation = { tag: string; title: string; description: string };

export type ServiceFormValues = {
  id?: string;
  slug: string;
  image: string;
  order: number;
  isActive: boolean;
  fa: Translation;
  en: Translation;
  ar: Translation;
};

const EMPTY_TRANSLATION: Translation = { tag: "", title: "", description: "" };

const LOCALE_ORDER: Locale[] = ["fa", "en", "ar"];

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function ServiceForm({ initial }: { initial?: ServiceFormValues }) {
  const t = useTranslations("servicesAdmin");
  const tCommon = useTranslations("panel.common");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const mode = initial?.id ? "edit" : "create";

  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [image, setImage] = useState(initial?.image ?? "");
  const [order, setOrder] = useState(initial?.order ?? 0);
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [imageError, setImageError] = useState(false);
  const [translations, setTranslations] = useState<Record<Locale, Translation>>({
    fa: initial?.fa ?? EMPTY_TRANSLATION,
    en: initial?.en ?? EMPTY_TRANSLATION,
    ar: initial?.ar ?? EMPTY_TRANSLATION,
  });

  function updateTranslation(locale: Locale, field: keyof Translation, value: string) {
    setTranslations((prev) => ({ ...prev, [locale]: { ...prev[locale], [field]: value } }));
    if (locale === "en" && field === "title" && !slugTouched) {
      setSlug(slugify(value));
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = {
      slug,
      image,
      order,
      isActive,
      fa: translations.fa,
      en: translations.en,
      ar: translations.ar,
    };

    startTransition(async () => {
      const result =
        mode === "edit" && initial?.id
          ? await updateServiceAction({ id: initial.id, ...payload })
          : await createServiceAction(payload);

      if (result.ok) {
        toast.success(t(mode === "edit" ? "toast.updated" : "toast.created"));
        router.push("/panel/admin/services");
        router.refresh();
      } else if (result.error === "SLUG_TAKEN") {
        toast.error(t("toast.slugTaken"));
      } else {
        toast.error(tCommon("error"));
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-sm dark:border-navy-800 dark:bg-navy-900">
        <div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto]">
          <Field label={t("form.slug")} htmlFor="slug" hint={t("form.slugHint")} required>
            <Input
              id="slug"
              dir="ltr"
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(slugify(e.target.value));
              }}
              required
            />
          </Field>
          <Field label={t("form.order")} htmlFor="order" hint={t("form.orderHint")} required>
            <Input
              id="order"
              type="number"
              min={0}
              value={order}
              onChange={(e) => setOrder(Number(e.target.value))}
              required
            />
          </Field>
          <div className="flex items-center gap-3 sm:pt-6">
            <Switch checked={isActive} onCheckedChange={setIsActive} id="isActive" />
            <label htmlFor="isActive" className="text-sm font-medium text-navy-700 dark:text-navy-200">
              {t("form.isActive")}
            </label>
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto]">
          <Field label={t("form.image")} htmlFor="image" hint={t("form.imageHint")} required>
            <Input
              id="image"
              dir="ltr"
              value={image}
              onChange={(e) => {
                setImage(e.target.value);
                setImageError(false);
              }}
              placeholder="/services/hair-transplant.png"
              required
            />
          </Field>
          <div className="flex h-20 w-20 shrink-0 items-center justify-center self-end overflow-hidden rounded-xl border border-dashed border-navy-200 bg-navy-50 dark:border-navy-700 dark:bg-navy-800">
            {image && !imageError ? (
              <Image
                src={image}
                alt=""
                width={80}
                height={80}
                className="h-full w-full object-contain"
                onError={() => setImageError(true)}
              />
            ) : (
              <ImageOff className="h-6 w-6 text-navy-300" />
            )}
          </div>
        </div>
      </div>

      {LOCALE_ORDER.map((locale) => (
        <div
          key={locale}
          className="rounded-2xl border border-navy-100 bg-white p-5 shadow-sm dark:border-navy-800 dark:bg-navy-900"
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-navy-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-navy-600 dark:bg-navy-800 dark:text-navy-300">
            {t(`localeLabels.${locale}`)}
          </span>

          <div className="mt-4 grid gap-4">
            <Field label={t("form.tag")} htmlFor={`${locale}-tag`} required>
              <Input
                id={`${locale}-tag`}
                dir={locale === "en" ? "ltr" : "rtl"}
                value={translations[locale].tag}
                onChange={(e) => updateTranslation(locale, "tag", e.target.value)}
                required
              />
            </Field>
            <Field label={t("form.titleLabel")} htmlFor={`${locale}-title`} required>
              <Input
                id={`${locale}-title`}
                dir={locale === "en" ? "ltr" : "rtl"}
                value={translations[locale].title}
                onChange={(e) => updateTranslation(locale, "title", e.target.value)}
                required
              />
            </Field>
            <Field label={t("form.description")} htmlFor={`${locale}-description`} required>
              <Textarea
                id={`${locale}-description`}
                dir={locale === "en" ? "ltr" : "rtl"}
                rows={3}
                value={translations[locale].description}
                onChange={(e) => updateTranslation(locale, "description", e.target.value)}
                required
              />
            </Field>
          </div>
        </div>
      ))}

      <div className="flex items-center gap-3">
        <Button type="submit" variant="gold" loading={isPending}>
          {tCommon("save")}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/panel/admin/services")}>
          {tCommon("cancel")}
        </Button>
      </div>
    </form>
  );
}
