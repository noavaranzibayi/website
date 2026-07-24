"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportUsersCsvAction } from "@/lib/actions/users";

export default function ExportUsersButton({ scope }: { scope: "all" | "admins" }) {
  const t = useTranslations("users");
  const tCommon = useTranslations("panel.common");
  const [isPending, startTransition] = useTransition();

  function handleExport() {
    startTransition(async () => {
      const result = await exportUsersCsvAction(scope);
      if (!result.ok) {
        toast.error(tCommon("error"));
        return;
      }
      const blob = new Blob([result.csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${scope}-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success(t("toast.exported"));
    });
  }

  return (
    <Button variant="outline" size="sm" onClick={handleExport} loading={isPending}>
      <Download className="h-4 w-4" />
      {t("actions.exportCsv")}
    </Button>
  );
}
