"use client";

import { useState, useTransition, type FormEvent } from "react";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Input } from "@/components/ui/input";

export default function ServicesFilters({
  basePath,
  initialQuery,
}: {
  basePath: string;
  initialQuery?: string;
}) {
  const t = useTranslations("servicesAdmin");
  const router = useRouter();
  const [q, setQ] = useState(initialQuery ?? "");
  const [, startTransition] = useTransition();

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    startTransition(() => {
      router.push(`${basePath}${params.toString() ? `?${params.toString()}` : ""}`);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-3 p-4">
      <div className="relative flex-1 min-w-[220px]">
        <Search className="pointer-events-none absolute inset-y-0 start-3 my-auto h-4 w-4 text-navy-400" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="ps-9"
        />
      </div>
    </form>
  );
}
