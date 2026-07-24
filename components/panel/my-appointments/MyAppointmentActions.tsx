"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Ban, CalendarClock } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
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
import { userCancelAppointmentAction, userRequestRescheduleAction } from "@/lib/actions/appointments";

export default function MyAppointmentActions({ id }: { id: string }) {
  const t = useTranslations("appointments");
  const tCommon = useTranslations("panel.common");
  const router = useRouter();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleCancel(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await userCancelAppointmentAction({ id, reason: form.get("reason") });
      toast[result.ok ? "success" : "error"](result.ok ? t("toast.cancelled") : tCommon("error"));
      if (result.ok) {
        setCancelOpen(false);
        router.refresh();
      }
    });
  }

  function handleReschedule(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await userRequestRescheduleAction({ id, message: form.get("message") });
      toast[result.ok ? "success" : "error"](result.ok ? tCommon("success") : tCommon("error"));
      if (result.ok) {
        setRescheduleOpen(false);
        router.refresh();
      }
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Dialog open={rescheduleOpen} onOpenChange={setRescheduleOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant="outline">
            <CalendarClock className="h-4 w-4" />
            {t("actions.requestReschedule")}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("actions.requestReschedule")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleReschedule} className="mt-4 flex flex-col gap-4">
            <Field label={t("detail.messageToUser")} htmlFor="message" required>
              <Textarea id="message" name="message" rows={3} required />
            </Field>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  {tCommon("cancel")}
                </Button>
              </DialogClose>
              <Button type="submit" variant="gold" loading={isPending}>
                {tCommon("confirm")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant="destructive">
            <Ban className="h-4 w-4" />
            {t("actions.requestCancel")}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("confirm.cancelTitle")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCancel} className="mt-4 flex flex-col gap-4">
            <Field label={t("confirm.cancelReasonLabel")} htmlFor="reason" required>
              <Textarea id="reason" name="reason" rows={3} required />
            </Field>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  {tCommon("cancel")}
                </Button>
              </DialogClose>
              <Button type="submit" variant="destructive" loading={isPending}>
                {t("actions.cancel")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
