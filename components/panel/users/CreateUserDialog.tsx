"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { createUserAction } from "@/lib/actions/users";

export default function CreateUserDialog({ role }: { role: "USER" | "ADMIN" }) {
  const t = useTranslations("users");
  const tCommon = useTranslations("panel.common");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(searchParams.get("new") === "1");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await createUserAction({
        name: form.get("name"),
        email: form.get("email"),
        phone: form.get("phone"),
        password: form.get("password"),
        role,
      });

      if (!result.ok) {
        setError(tCommon("error"));
        return;
      }

      toast.success(t("toast.created"));
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="gold" size="sm">
          <UserPlus className="h-4 w-4" />
          {role === "ADMIN" ? t("addAdmin") : t("addUser")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("createTitle")}</DialogTitle>
          <DialogDescription>{role === "ADMIN" ? t("adminsSubtitle") : t("subtitle")}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <Field label={t("form.name")} htmlFor="name" required>
            <Input id="name" name="name" required />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("form.email")} htmlFor="email" required>
              <Input id="email" name="email" type="email" dir="ltr" required />
            </Field>
            <Field label={t("form.phone")} htmlFor="phone">
              <Input id="phone" name="phone" type="tel" dir="ltr" />
            </Field>
          </div>
          <Field label={t("form.temporaryPassword")} htmlFor="password" required>
            <Input id="password" name="password" type="text" dir="ltr" required minLength={8} />
          </Field>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                {tCommon("cancel")}
              </Button>
            </DialogClose>
            <Button type="submit" variant="gold" loading={isPending}>
              {tCommon("save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
