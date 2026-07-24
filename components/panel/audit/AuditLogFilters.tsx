"use client";

import { useState, type FormEvent } from "react";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Input } from "@/components/ui/input";

export default function AuditLogFilters({ basePath, initialQuery }: { basePath: string; initialQuery?: string }) {
  const t = useTranslations("auditLog");
  const router = useRouter();
  const [q, setQ] = useState(initialQuery ?? "");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    router.push(q ? `${basePath}?q=${encodeURIComponent(q)}` : basePath);
  }

  return (
    <form onSubmit={handleSubmit} className="p-4">
      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute inset-y-0 start-3 my-auto h-4 w-4 text-navy-400" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("searchPlaceholder")} className="ps-9" />
      </div>
    </form>
  );
}
