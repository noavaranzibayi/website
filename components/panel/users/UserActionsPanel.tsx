"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { CheckCircle2, PauseCircle, Ban, Mail, LogOut, Trash2 } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { UserStatusBadge } from "@/components/panel/shared/Badges";
import {
  changeUserStatusAction,
  sendUserResetLinkAction,
  forceLogoutUserAction,
  deleteUserAction,
} from "@/lib/actions/users";
import type { UserStatus } from "@/app/generated/prisma/client";

export default function UserActionsPanel({
  id,
  status,
  canEdit,
  canManage,
  canDelete,
}: {
  id: string;
  status: UserStatus;
  canEdit: boolean;
  canManage: boolean;
  canDelete: boolean;
}) {
  const t = useTranslations("users");
  const tCommon = useTranslations("panel.common");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  function handleStatus(next: UserStatus) {
    startTransition(async () => {
      const result = await changeUserStatusAction({ id, status: next });
      toast[result.ok ? "success" : "error"](result.ok ? t("toast.statusChanged") : tCommon("error"));
      if (result.ok) router.refresh();
    });
  }

  function handleResetLink() {
    startTransition(async () => {
      const result = await sendUserResetLinkAction(id);
      toast[result.ok ? "success" : "error"](result.ok ? t("toast.resetLinkSent") : tCommon("error"));
    });
  }

  function handleForceLogout() {
    startTransition(async () => {
      const result = await forceLogoutUserAction(id);
      toast[result.ok ? "success" : "error"](result.ok ? t("toast.forcedLogout") : tCommon("error"));
      setConfirmLogout(false);
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteUserAction(id);
      if (result.ok) {
        toast.success(t("toast.deleted"));
        router.push("/panel/admin/users");
      } else {
        toast.error(tCommon("error"));
        setConfirmDelete(false);
      }
    });
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-navy-100 bg-white p-5 dark:border-navy-800 dark:bg-navy-900">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-navy-800 dark:text-white">{t("columns.status")}</span>
        <UserStatusBadge status={status} />
      </div>

      {canEdit && (
        <div className="flex flex-wrap gap-2">
          {status !== "ACTIVE" && (
            <Button size="sm" variant="outline" onClick={() => handleStatus("ACTIVE")} disabled={isPending}>
              <CheckCircle2 className="h-4 w-4" />
              {t("actions.activate")}
            </Button>
          )}
          {status !== "SUSPENDED" && (
            <Button size="sm" variant="outline" onClick={() => handleStatus("SUSPENDED")} disabled={isPending}>
              <PauseCircle className="h-4 w-4" />
              {t("actions.suspend")}
            </Button>
          )}
          {status !== "BLOCKED" && (
            <Button size="sm" variant="outline" onClick={() => handleStatus("BLOCKED")} disabled={isPending}>
              <Ban className="h-4 w-4" />
              {t("actions.block")}
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={handleResetLink} disabled={isPending}>
            <Mail className="h-4 w-4" />
            {t("actions.sendResetLink")}
          </Button>
        </div>
      )}

      {canManage && (
        <Button size="sm" variant="outline" onClick={() => setConfirmLogout(true)} disabled={isPending} className="w-fit">
          <LogOut className="h-4 w-4" />
          {t("actions.forceLogout")}
        </Button>
      )}

      {canDelete && (
        <div className="border-t border-navy-100 pt-4 dark:border-navy-800">
          <Button size="sm" variant="destructive" onClick={() => setConfirmDelete(true)} disabled={isPending}>
            <Trash2 className="h-4 w-4" />
            {t("actions.delete")}
          </Button>
        </div>
      )}

      <AlertDialog open={confirmLogout} onOpenChange={setConfirmLogout}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("confirm.forceLogoutTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("confirm.forceLogoutDescription")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
            <AlertDialogAction variant="primary" onClick={handleForceLogout} disabled={isPending}>
              {tCommon("confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("confirm.deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("confirm.deleteDescription")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isPending}>
              {tCommon("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
