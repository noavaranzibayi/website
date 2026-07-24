"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { changePasswordAction } from "@/lib/actions/profile";

export default function ChangePasswordForm() {
  const t = useTranslations("profile.changePassword");
  const tAuthErrors = useTranslations("auth.resetPassword.errors");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await changePasswordAction({
        currentPassword: form.get("currentPassword"),
        newPassword: form.get("newPassword"),
        confirmPassword: form.get("confirmPassword"),
      });
      if (!result.ok) {
        setError(
          result.error === "WRONG_CURRENT"
            ? t("wrongCurrent")
            : result.error === "MISMATCH"
              ? tAuthErrors("passwordMismatch")
              : tAuthErrors("generic")
        );
        return;
      }
      toast.success(t("success"));
      event.currentTarget.reset();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-md flex-col gap-4">
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <Field label={t("currentPassword")} htmlFor="currentPassword" required>
        <div className="relative">
          <Input
            id="currentPassword"
            name="currentPassword"
            type={show ? "text" : "password"}
            dir="ltr"
            className="pe-10"
            required
          />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            className="absolute inset-y-0 end-0 flex w-10 items-center justify-center text-navy-400 hover:text-navy-600"
            tabIndex={-1}
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </Field>
      <Field label={t("newPassword")} htmlFor="newPassword" required>
        <Input id="newPassword" name="newPassword" type={show ? "text" : "password"} dir="ltr" required minLength={8} />
      </Field>
      <Field label={t("confirmPassword")} htmlFor="confirmPassword" required>
        <Input id="confirmPassword" name="confirmPassword" type={show ? "text" : "password"} dir="ltr" required minLength={8} />
      </Field>
      <div>
        <Button type="submit" variant="gold" loading={isPending}>
          {t("submit")}
        </Button>
      </div>
    </form>
  );
}
