"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { createAppointmentAction } from "@/lib/actions/appointments";

type ServiceOption = { id: string; title: string };

export default function NewAppointmentDialog({
  services,
  defaultEmail,
}: {
  services: ServiceOption[];
  defaultEmail: string;
}) {
  const t = useTranslations("appointments");
  const tCommon = useTranslations("panel.common");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await createAppointmentAction({
        subject: form.get("subject"),
        description: form.get("description"),
        date: form.get("date"),
        time: form.get("time"),
        durationMin: form.get("durationMin") || 30,
        type: form.get("type"),
        contactPhone: form.get("contactPhone"),
        contactEmail: form.get("contactEmail"),
        serviceId: form.get("serviceId"),
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

  const today = new Date().toISOString().slice(0, 10);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="gold" size="sm">
          <Plus className="h-4 w-4" />
          {t("newRequest")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("newRequest")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="mt-4 flex max-h-[70vh] flex-col gap-4 overflow-y-auto">
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

          <Field label={t("form.subject")} htmlFor="subject" required>
            <Input id="subject" name="subject" required />
          </Field>

          {services.length > 0 && (
            <Field label={t("columns.type")} htmlFor="serviceId">
              <select
                id="serviceId"
                name="serviceId"
                defaultValue=""
                className="h-10 w-full rounded-xl border border-navy-200 bg-white px-3.5 text-sm text-navy-900 outline-none focus:border-gold-400 focus:ring-4 focus:ring-gold-100 dark:border-navy-700 dark:bg-navy-900 dark:text-white"
              >
                <option value="">—</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </select>
            </Field>
          )}

          <Field label={t("form.description")} htmlFor="description">
            <Textarea id="description" name="description" rows={3} />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("form.date")} htmlFor="date" required>
              <Input id="date" name="date" type="date" min={today} required />
            </Field>
            <Field label={t("form.time")} htmlFor="time" required>
              <Input id="time" name="time" type="time" required />
            </Field>
          </div>

          <Field label={t("form.type")} htmlFor="type" required>
            <select
              id="type"
              name="type"
              defaultValue="IN_PERSON"
              className="h-10 w-full rounded-xl border border-navy-200 bg-white px-3.5 text-sm text-navy-900 outline-none focus:border-gold-400 focus:ring-4 focus:ring-gold-100 dark:border-navy-700 dark:bg-navy-900 dark:text-white"
            >
              <option value="IN_PERSON">{t("type.IN_PERSON")}</option>
              <option value="ONLINE">{t("type.ONLINE")}</option>
              <option value="PHONE">{t("type.PHONE")}</option>
            </select>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("form.contactPhone")} htmlFor="contactPhone" required>
              <Input id="contactPhone" name="contactPhone" type="tel" dir="ltr" required />
            </Field>
            <Field label={t("form.contactEmail")} htmlFor="contactEmail">
              <Input id="contactEmail" name="contactEmail" type="email" dir="ltr" defaultValue={defaultEmail} />
            </Field>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                {tCommon("cancel")}
              </Button>
            </DialogClose>
            <Button type="submit" variant="gold" loading={isPending}>
              {t("form.submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
