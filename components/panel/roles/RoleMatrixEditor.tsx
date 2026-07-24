"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { updateAdminRoleMatrixAction } from "@/lib/actions/permissions";
import { MODULES, ACTIONS, permissionKey, type PermissionKey } from "@/lib/rbac-constants";
import { cn } from "@/lib/cn";

export default function RoleMatrixEditor({ initialGrants }: { initialGrants: Record<PermissionKey, boolean> }) {
  const t = useTranslations("roles");
  const tCommon = useTranslations("panel.common");
  const router = useRouter();
  const [grants, setGrants] = useState(initialGrants);
  const [isPending, startTransition] = useTransition();

  function toggle(key: PermissionKey) {
    setGrants((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function handleSave() {
    startTransition(async () => {
      const payload = MODULES.flatMap((mod) =>
        ACTIONS.map((action) => ({ module: mod, action, granted: !!grants[permissionKey(mod, action)] }))
      );
      const result = await updateAdminRoleMatrixAction({ grants: payload });
      toast[result.ok ? "success" : "error"](result.ok ? t("matrixSaved") : tCommon("error"));
      if (result.ok) router.refresh();
    });
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-navy-500 dark:text-navy-400">{t("systemRoleNotice")}</p>
        <Button variant="gold" size="sm" onClick={handleSave} loading={isPending}>
          {t("saveMatrix")}
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-navy-100 dark:border-navy-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-navy-100 bg-navy-50/60 dark:border-navy-800 dark:bg-navy-900/60">
              <th className="px-3 py-2.5 text-start text-xs font-semibold text-navy-500">{t("title")}</th>
              {ACTIONS.map((action) => (
                <th key={action} className="px-2 py-2.5 text-center text-xs font-semibold text-navy-500">
                  {t(`actionsLabels.${action}`)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MODULES.map((mod) => (
              <tr key={mod} className="border-b border-navy-50 last:border-0 dark:border-navy-800/60">
                <td className="px-3 py-2.5 text-sm font-semibold text-navy-700 dark:text-navy-200">
                  {t(`modules.${mod}`)}
                </td>
                {ACTIONS.map((action) => {
                  const key = permissionKey(mod, action);
                  const checked = !!grants[key];
                  return (
                    <td key={action} className="px-2 py-2 text-center">
                      <button
                        type="button"
                        onClick={() => toggle(key)}
                        className={cn(
                          "mx-auto flex h-7 w-7 items-center justify-center rounded-lg border transition-colors",
                          checked
                            ? "border-lime-300 bg-lime-100 text-lime-700 dark:border-lime-700 dark:bg-lime-900/30 dark:text-lime-300"
                            : "border-navy-100 bg-transparent text-transparent dark:border-navy-800"
                        )}
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
