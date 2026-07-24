"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { updateUserAction, changeUserRoleAction } from "@/lib/actions/users";
import type { RoleName } from "@/app/generated/prisma/client";

export default function UserOverviewForm({
  id,
  name,
  email,
  phone,
  role,
  canEdit,
  canChangeRole,
  isSelf,
}: {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: RoleName;
  canEdit: boolean;
  canChangeRole: boolean;
  isSelf: boolean;
}) {
  const t = useTranslations("users");
  const tCommon = useTranslations("panel.common");
  const tRoles = useTranslations("panel.roleLabels");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [roleValue, setRoleValue] = useState(role);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await updateUserAction({
        id,
        name: form.get("name"),
        email: form.get("email"),
        phone: form.get("phone"),
      });
      toast[result.ok ? "success" : "error"](result.ok ? t("toast.updated") : tCommon("error"));
      if (result.ok) router.refresh();
    });
  }

  function handleRoleChange(next: string) {
    setRoleValue(next as RoleName);
    startTransition(async () => {
      const result = await changeUserRoleAction({ id, role: next });
      toast[result.ok ? "success" : "error"](result.ok ? t("toast.roleChanged") : tCommon("error"));
      if (result.ok) router.refresh();
      else setRoleValue(role);
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {canChangeRole && !isSelf && (
        <div className="flex items-center justify-between rounded-xl border border-navy-100 p-4 dark:border-navy-800">
          <div>
            <p className="text-sm font-bold text-navy-800 dark:text-white">{t("actions.changeRole")}</p>
          </div>
          <Select value={roleValue} onValueChange={handleRoleChange}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USER">{tRoles("USER")}</SelectItem>
              <SelectItem value="ADMIN">{tRoles("ADMIN")}</SelectItem>
              <SelectItem value="SUPER_ADMIN">{tRoles("SUPER_ADMIN")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t("form.name")} htmlFor="name" required>
            <Input id="name" name="name" defaultValue={name} disabled={!canEdit} required />
          </Field>
          <Field label={t("form.email")} htmlFor="email" required>
            <Input id="email" name="email" type="email" dir="ltr" defaultValue={email} disabled={!canEdit} required />
          </Field>
        </div>
        <Field label={t("form.phone")} htmlFor="phone">
          <Input id="phone" name="phone" type="tel" dir="ltr" defaultValue={phone ?? ""} disabled={!canEdit} />
        </Field>
        {canEdit && (
          <div>
            <Button type="submit" variant="gold" loading={isPending}>
              {tCommon("save")}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
