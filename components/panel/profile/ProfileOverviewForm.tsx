"use client";

import { useTransition, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { updateProfileAction } from "@/lib/actions/profile";

export default function ProfileOverviewForm({
  name,
  email,
  phone,
}: {
  name: string;
  email: string;
  phone: string | null;
}) {
  const t = useTranslations("profile.form");
  const tCommon = useTranslations("panel.common");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await updateProfileAction({
        name: form.get("name"),
        email: form.get("email"),
        phone: form.get("phone"),
      });
      toast[result.ok ? "success" : "error"](result.ok ? tCommon("success") : tCommon("error"));
      if (result.ok) router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("name")} htmlFor="name" required>
          <Input id="name" name="name" defaultValue={name} required />
        </Field>
        <Field label={t("email")} htmlFor="email" required>
          <Input id="email" name="email" type="email" dir="ltr" defaultValue={email} required />
        </Field>
      </div>
      <Field label={t("phone")} htmlFor="phone">
        <Input id="phone" name="phone" type="tel" dir="ltr" defaultValue={phone ?? ""} />
      </Field>
      <div>
        <Button type="submit" variant="gold" loading={isPending}>
          {t("save")}
        </Button>
      </div>
    </form>
  );
}
