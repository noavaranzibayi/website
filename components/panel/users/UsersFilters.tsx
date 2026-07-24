"use client";

import { useState, useTransition, type FormEvent } from "react";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

export default function UsersFilters({
  basePath,
  initialQuery,
  initialRole,
  initialStatus,
  showRoleFilter = true,
}: {
  basePath: string;
  initialQuery?: string;
  initialRole?: string;
  initialStatus?: string;
  showRoleFilter?: boolean;
}) {
  const t = useTranslations("panel.table");
  const tUsers = useTranslations("users");
  const tRoles = useTranslations("panel.roleLabels");
  const tStatuses = useTranslations("panel.statusLabels");
  const router = useRouter();
  const [q, setQ] = useState(initialQuery ?? "");
  const [, startTransition] = useTransition();

  function navigate(next: { q?: string; role?: string; status?: string }) {
    const params = new URLSearchParams();
    const query = next.q ?? q;
    const role = next.role ?? initialRole ?? "";
    const status = next.status ?? initialStatus ?? "";
    if (query) params.set("q", query);
    if (role) params.set("role", role);
    if (status) params.set("status", status);
    startTransition(() => {
      router.push(`${basePath}${params.toString() ? `?${params.toString()}` : ""}`);
    });
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    navigate({ q });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-3 p-4">
      <div className="relative flex-1 min-w-[220px]">
        <Search className="pointer-events-none absolute inset-y-0 start-3 my-auto h-4 w-4 text-navy-400" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={tUsers("searchPlaceholder")}
          className="ps-9"
        />
      </div>

      {showRoleFilter && (
        <Select value={initialRole ?? "ALL"} onValueChange={(v) => navigate({ role: v === "ALL" ? "" : v })}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t("allRoles")}</SelectItem>
            <SelectItem value="USER">{tRoles("USER")}</SelectItem>
            <SelectItem value="ADMIN">{tRoles("ADMIN")}</SelectItem>
            <SelectItem value="SUPER_ADMIN">{tRoles("SUPER_ADMIN")}</SelectItem>
          </SelectContent>
        </Select>
      )}

      <Select value={initialStatus ?? "ALL"} onValueChange={(v) => navigate({ status: v === "ALL" ? "" : v })}>
        <SelectTrigger className="w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">{t("allStatuses")}</SelectItem>
          <SelectItem value="ACTIVE">{tStatuses("ACTIVE")}</SelectItem>
          <SelectItem value="PENDING_VERIFICATION">{tStatuses("PENDING_VERIFICATION")}</SelectItem>
          <SelectItem value="SUSPENDED">{tStatuses("SUSPENDED")}</SelectItem>
          <SelectItem value="BLOCKED">{tStatuses("BLOCKED")}</SelectItem>
          <SelectItem value="INACTIVE">{tStatuses("INACTIVE")}</SelectItem>
        </SelectContent>
      </Select>
    </form>
  );
}
