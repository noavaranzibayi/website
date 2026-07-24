"use client";

import { useState, useTransition } from "react";
import { useTranslations, useFormatter } from "next-intl";
import { toast } from "sonner";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  MoreVertical,
  Eye,
  LogOut,
  Trash2,
  CheckCircle2,
  Ban,
  PauseCircle,
  Mail,
} from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/state";
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
import { RoleBadge, UserStatusBadge } from "@/components/panel/shared/Badges";
import {
  changeUserStatusAction,
  sendUserResetLinkAction,
  forceLogoutUserAction,
  deleteUserAction,
  bulkChangeStatusAction,
  bulkDeleteAction,
} from "@/lib/actions/users";
import { Users as UsersIcon } from "lucide-react";
import type { RoleName, UserStatus } from "@/app/generated/prisma/client";

export type UserRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  image: string | null;
  role: RoleName;
  status: UserStatus;
  createdAt: Date;
  lastLoginAt: Date | null;
};

export default function UsersTable({
  rows,
  currentUserId,
  currentUserRole,
  canEdit,
  canDelete,
  canManage,
}: {
  rows: UserRow[];
  currentUserId: string;
  currentUserRole: RoleName;
  canEdit: boolean;
  canDelete: boolean;
  canManage: boolean;
}) {
  const t = useTranslations("users");
  const tCommon = useTranslations("panel.common");
  const tConfirm = useTranslations("users.confirm");
  const tTable = useTranslations("panel.table");
  const format = useFormatter();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<UserRow | null>(null);
  const [forceLogoutTarget, setForceLogoutTarget] = useState<UserRow | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  const selectableRows = rows.filter((r) => r.id !== currentUserId);
  const allSelected = selectableRows.length > 0 && selectableRows.every((r) => selected.has(r.id));

  function toggleAll() {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(selectableRows.map((r) => r.id)));
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function canModify(row: UserRow) {
    if (row.id === currentUserId) return false;
    if (row.role === "SUPER_ADMIN" && currentUserRole !== "SUPER_ADMIN") return false;
    return true;
  }

  function handleStatusChange(row: UserRow, status: UserStatus) {
    startTransition(async () => {
      const result = await changeUserStatusAction({ id: row.id, status });
      if (result.ok) {
        toast.success(t("toast.statusChanged"));
        router.refresh();
      } else {
        toast.error(tConfirm(result.error === "LAST_SUPER_ADMIN" ? "cannotModifySuperAdmin" : "cannotModifySuperAdmin"));
      }
    });
  }

  function handleResetLink(row: UserRow) {
    startTransition(async () => {
      const result = await sendUserResetLinkAction(row.id);
      toast[result.ok ? "success" : "error"](result.ok ? t("toast.resetLinkSent") : tCommon("error"));
    });
  }

  function handleForceLogout() {
    if (!forceLogoutTarget) return;
    const row = forceLogoutTarget;
    startTransition(async () => {
      const result = await forceLogoutUserAction(row.id);
      toast[result.ok ? "success" : "error"](result.ok ? t("toast.forcedLogout") : tCommon("error"));
      setForceLogoutTarget(null);
    });
  }

  function handleDelete() {
    if (!deleteTarget) return;
    const row = deleteTarget;
    startTransition(async () => {
      const result = await deleteUserAction(row.id);
      if (result.ok) {
        toast.success(t("toast.deleted"));
        router.refresh();
      } else {
        toast.error(tCommon("error"));
      }
      setDeleteTarget(null);
    });
  }

  function handleBulkStatus(status: UserStatus) {
    startTransition(async () => {
      await bulkChangeStatusAction({ ids: Array.from(selected) }, status);
      toast.success(tCommon("success"));
      setSelected(new Set());
      router.refresh();
    });
  }

  function handleBulkDelete() {
    startTransition(async () => {
      await bulkDeleteAction({ ids: Array.from(selected) });
      toast.success(tCommon("success"));
      setSelected(new Set());
      setBulkDeleteOpen(false);
      router.refresh();
    });
  }

  if (rows.length === 0) {
    return (
      <EmptyState icon={UsersIcon} title={t("title")} description={undefined} className="py-16" />
    );
  }

  return (
    <div>
      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-3 border-b border-navy-100 bg-navy-50/60 px-4 py-3 dark:border-navy-800 dark:bg-navy-900/60">
          <span className="text-sm font-semibold text-navy-700 dark:text-navy-200">
            {tTable("selectedCount", { count: selected.size })}
          </span>
          {canManage && (
            <>
              <Button size="sm" variant="outline" onClick={() => handleBulkStatus("ACTIVE")} disabled={isPending}>
                {t("actions.bulkActivate")}
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleBulkStatus("SUSPENDED")} disabled={isPending}>
                {t("actions.bulkSuspend")}
              </Button>
            </>
          )}
          {canDelete && (
            <Button size="sm" variant="destructive" onClick={() => setBulkDeleteOpen(true)} disabled={isPending}>
              {t("actions.bulkDelete")}
            </Button>
          )}
          <button
            type="button"
            onClick={() => setSelected(new Set())}
            className="text-xs font-medium text-navy-400 hover:text-navy-600"
          >
            {tTable("clearSelection")}
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-start text-sm">
          <thead>
            <tr className="border-b border-navy-100 text-xs text-navy-400 dark:border-navy-800">
              <th className="w-10 px-4 py-3">
                <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
              </th>
              <th className="px-2 py-3 text-start font-semibold">{t("columns.user")}</th>
              <th className="px-2 py-3 text-start font-semibold">{t("columns.role")}</th>
              <th className="px-2 py-3 text-start font-semibold">{t("columns.status")}</th>
              <th className="px-2 py-3 text-start font-semibold">{t("columns.joined")}</th>
              <th className="px-2 py-3 text-start font-semibold">{t("columns.lastLogin")}</th>
              <th className="w-10 px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const modifiable = canModify(row);
              const initials = row.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
              return (
                <tr
                  key={row.id}
                  className="border-b border-navy-50 last:border-0 hover:bg-navy-50/40 dark:border-navy-800/60 dark:hover:bg-navy-900/40"
                >
                  <td className="px-4 py-3">
                    {row.id !== currentUserId && (
                      <Checkbox checked={selected.has(row.id)} onCheckedChange={() => toggleOne(row.id)} />
                    )}
                  </td>
                  <td className="px-2 py-3">
                    <Link href={`/panel/admin/users/${row.id}`} className="flex items-center gap-2.5">
                      <Avatar className="h-8 w-8">
                        {row.image && <AvatarImage src={row.image} alt={row.name} />}
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-navy-800 dark:text-white">{row.name}</p>
                        <p className="truncate text-xs text-navy-400" dir="ltr">
                          {row.email}
                        </p>
                      </div>
                    </Link>
                  </td>
                  <td className="px-2 py-3">
                    <RoleBadge role={row.role} />
                  </td>
                  <td className="px-2 py-3">
                    <UserStatusBadge status={row.status} />
                  </td>
                  <td className="whitespace-nowrap px-2 py-3 text-navy-500">
                    {format.dateTime(row.createdAt, { year: "numeric", month: "short", day: "numeric" })}
                  </td>
                  <td className="whitespace-nowrap px-2 py-3 text-navy-500">
                    {row.lastLoginAt
                      ? format.dateTime(row.lastLoginAt, { year: "numeric", month: "short", day: "numeric" })
                      : t("neverLoggedIn")}
                  </td>
                  <td className="px-4 py-3">
                    <DropdownMenu.Root>
                      <DropdownMenu.Trigger asChild>
                        <button
                          type="button"
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-navy-400 hover:bg-navy-100 dark:hover:bg-navy-800"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </DropdownMenu.Trigger>
                      <DropdownMenu.Portal>
                        <DropdownMenu.Content
                          align="end"
                          sideOffset={6}
                          className="dropdown-content z-[60] min-w-[13rem] rounded-xl border border-navy-100 bg-white p-1.5 shadow-lg ring-1 ring-black/5 dark:border-navy-700 dark:bg-navy-900"
                        >
                          <DropdownMenu.Item asChild>
                            <Link
                              href={`/panel/admin/users/${row.id}`}
                              className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-navy-700 outline-none data-[highlighted]:bg-navy-50 dark:text-navy-200 dark:data-[highlighted]:bg-navy-800"
                            >
                              <Eye className="h-4 w-4 text-navy-400" />
                              {t("actions.viewDetails")}
                            </Link>
                          </DropdownMenu.Item>

                          {modifiable && canEdit && (
                            <>
                              <DropdownMenu.Separator className="my-1 h-px bg-navy-100 dark:bg-navy-800" />
                              {row.status !== "ACTIVE" && (
                                <DropdownMenu.Item
                                  onSelect={() => handleStatusChange(row, "ACTIVE")}
                                  className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-lime-700 outline-none data-[highlighted]:bg-lime-50 dark:text-lime-300 dark:data-[highlighted]:bg-lime-900/20"
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                  {t("actions.activate")}
                                </DropdownMenu.Item>
                              )}
                              {row.status !== "SUSPENDED" && (
                                <DropdownMenu.Item
                                  onSelect={() => handleStatusChange(row, "SUSPENDED")}
                                  className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-gold-700 outline-none data-[highlighted]:bg-gold-50 dark:text-gold-300 dark:data-[highlighted]:bg-gold-900/20"
                                >
                                  <PauseCircle className="h-4 w-4" />
                                  {t("actions.suspend")}
                                </DropdownMenu.Item>
                              )}
                              {row.status !== "BLOCKED" && (
                                <DropdownMenu.Item
                                  onSelect={() => handleStatusChange(row, "BLOCKED")}
                                  className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-red-600 outline-none data-[highlighted]:bg-red-50 dark:text-red-400 dark:data-[highlighted]:bg-red-900/20"
                                >
                                  <Ban className="h-4 w-4" />
                                  {t("actions.block")}
                                </DropdownMenu.Item>
                              )}
                              <DropdownMenu.Separator className="my-1 h-px bg-navy-100 dark:bg-navy-800" />
                              <DropdownMenu.Item
                                onSelect={() => handleResetLink(row)}
                                className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-navy-700 outline-none data-[highlighted]:bg-navy-50 dark:text-navy-200 dark:data-[highlighted]:bg-navy-800"
                              >
                                <Mail className="h-4 w-4 text-navy-400" />
                                {t("actions.sendResetLink")}
                              </DropdownMenu.Item>
                            </>
                          )}

                          {modifiable && canManage && (
                            <DropdownMenu.Item
                              onSelect={() => setForceLogoutTarget(row)}
                              className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-navy-700 outline-none data-[highlighted]:bg-navy-50 dark:text-navy-200 dark:data-[highlighted]:bg-navy-800"
                            >
                              <LogOut className="h-4 w-4 text-navy-400" />
                              {t("actions.forceLogout")}
                            </DropdownMenu.Item>
                          )}

                          {modifiable && canDelete && (
                            <>
                              <DropdownMenu.Separator className="my-1 h-px bg-navy-100 dark:bg-navy-800" />
                              <DropdownMenu.Item
                                onSelect={() => setDeleteTarget(row)}
                                className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-red-600 outline-none data-[highlighted]:bg-red-50 dark:text-red-400 dark:data-[highlighted]:bg-red-900/20"
                              >
                                <Trash2 className="h-4 w-4" />
                                {t("actions.delete")}
                              </DropdownMenu.Item>
                            </>
                          )}
                        </DropdownMenu.Content>
                      </DropdownMenu.Portal>
                    </DropdownMenu.Root>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
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

      <AlertDialog open={!!forceLogoutTarget} onOpenChange={(open) => !open && setForceLogoutTarget(null)}>
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

      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("confirm.bulkDeleteTitle", { count: selected.size })}</AlertDialogTitle>
            <AlertDialogDescription>{t("confirm.deleteDescription")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete} disabled={isPending}>
              {tCommon("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
