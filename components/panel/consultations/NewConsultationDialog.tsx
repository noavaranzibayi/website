"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { MessageSquarePlus } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { createConsultationAction } from "@/lib/actions/consultations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type ServiceOption = { id: string; title: string };

export default function NewConsultationDialog({ services }: { services: ServiceOption[] }) {
  const t = useTranslations("consultations");
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
      const result = await createConsultationAction({
        subject: form.get("subject"),
        serviceId: form.get("serviceId"),
        message: form.get("message"),
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
          <MessageSquarePlus className="h-4 w-4" />
          {t("newTicket")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("newTicket")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

          <Field label={t("form.subject")} htmlFor="subject" required>
            <Input id="subject" name="subject" required />
          </Field>

          <Field label={t("form.service")} htmlFor="serviceId">
            <select
              id="serviceId"
              name="serviceId"
              defaultValue=""
              className="h-10 w-full rounded-xl border border-navy-200 bg-white px-3.5 text-sm text-navy-900 outline-none focus:border-gold-400 focus:ring-4 focus:ring-gold-100 dark:border-navy-700 dark:bg-navy-900 dark:text-white"
            >
              <option value="">{t("form.servicePlaceholder")}</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.title}
                </option>
              ))}
            </select>
          </Field>

          <Field label={t("form.message")} htmlFor="message" required>
            <Textarea id="message" name="message" rows={6} required />
          </Field>

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