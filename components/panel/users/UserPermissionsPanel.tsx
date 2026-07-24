"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Check, Minus, X } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { setUserPermissionOverrideAction } from "@/lib/actions/permissions";
import { MODULES, ACTIONS, type PermissionKey } from "@/lib/rbac-constants";
import { cn } from "@/lib/cn";
import type { PermissionModule, PermissionAction } from "@/app/generated/prisma/client";

export type PermissionCell = {
  roleDefault: boolean;
  override: boolean | null; // null = no override
};

export default function UserPermissionsPanel({
  userId,
  matrix,
}: {
  userId: string;
  matrix: Record<PermissionKey, PermissionCell>;
}) {
  const t = useTranslations("roles");
  const tUsers = useTranslations("users.permissionsOverride");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function cycle(mod: PermissionModule, action: PermissionAction, current: PermissionCell) {
    // default -> granted -> denied -> default
    const next: boolean | null = current.override === null ? true : current.override === true ? false : null;
    startTransition(async () => {
      const result = await setUserPermissionOverrideAction({ userId, module: mod, action, granted: next });
      if (!result.ok) {
        toast.error("Error");
        return;
      }
      router.refresh();
    });
  }

  return (
    <div>
      <p className="mb-4 text-sm text-navy-500 dark:text-navy-400">{tUsers("description")}</p>
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
                  const cell = matrix[`${mod}:${action}` as PermissionKey] ?? { roleDefault: false, override: null };
                  const effective = cell.override ?? cell.roleDefault;
                  return (
                    <td key={action} className="px-2 py-2 text-center">
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => cycle(mod, action, cell)}
                        title={
                          cell.override === null
                            ? tUsers("default")
                            : cell.override
                              ? tUsers("granted")
                              : tUsers("denied")
                        }
                        className={cn(
                          "mx-auto flex h-7 w-7 items-center justify-center rounded-lg border transition-colors",
                          cell.override === null
                            ? effective
                              ? "border-navy-200 bg-navy-50 text-navy-400 dark:border-navy-700 dark:bg-navy-800"
                              : "border-navy-100 bg-transparent text-navy-300 dark:border-navy-800"
                            : cell.override
                              ? "border-lime-300 bg-lime-100 text-lime-700 dark:border-lime-700 dark:bg-lime-900/30 dark:text-lime-300"
                              : "border-red-300 bg-red-100 text-red-600 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400"
                        )}
                      >
                        {cell.override === null ? (
                          effective ? (
                            <Minus className="h-3.5 w-3.5" />
                          ) : (
                            <span className="h-1 w-1 rounded-full bg-current" />
                          )
                        ) : cell.override ? (
                          <Check className="h-3.5 w-3.5" />
                        ) : (
                          <X className="h-3.5 w-3.5" />
                        )}
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
