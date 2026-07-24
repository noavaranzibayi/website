"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { CheckCircle2, XCircle, CalendarClock, Ban, UserCheck2 } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  confirmAppointmentAction,
  rejectAppointmentAction,
  rescheduleAppointmentAction,
  cancelAppointmentAdminAction,
  completeAppointmentAction,
  markNoShowAction,
  assignAppointmentAction,
} from "@/lib/actions/appointments";
import type { AppointmentStatus } from "@/app/generated/prisma/client";

type AdminOption = { id: string; name: string };

export default function AppointmentActionsBar({
  id,
  status,
  assignedAdminId,
  admins,
  canApprove,
  canEdit,
}: {
  id: string;
  status: AppointmentStatus;
  assignedAdminId: string | null;
  admins: AdminOption[];
  canApprove: boolean;
  canEdit: boolean;
}) {
  const t = useTranslations("appointments");
  const tCommon = useTranslations("panel.common");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [conflictError, setConflictError] = useState<string | null>(null);
  const [assignee, setAssignee] = useState(assignedAdminId ?? "");

  function handleConfirm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setConflictError(null);
    const form = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await confirmAppointmentAction({
        id,
        date: form.get("date"),
        time: form.get("time"),
        durationMin: form.get("durationMin"),
        location: form.get("location"),
        meetingLink: form.get("meetingLink"),
        assignedAdminId: form.get("assignedAdminId"),
      });
      if (!result.ok) {
        if (result.error === "CONFLICT") setConflictError(t("confirm.conflictWarning") + ` (${result.conflict})`);
        else toast.error(tCommon("error"));
        return;
      }
      toast.success(t("toast.confirmed"));
      setConfirmOpen(false);
      router.refresh();
    });
  }

  function handleReject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await rejectAppointmentAction({ id, reason: form.get("reason") });
      toast[result.ok ? "success" : "error"](result.ok ? t("toast.rejected") : tCommon("error"));
      if (result.ok) {
        setRejectOpen(false);
        router.refresh();
      }
    });
  }

  function handleReschedule(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setConflictError(null);
    const form = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await rescheduleAppointmentAction({
        id,
        date: form.get("date"),
        time: form.get("time"),
        durationMin: form.get("durationMin"),
        note: form.get("note"),
      });
      if (!result.ok) {
        if (result.error === "CONFLICT") setConflictError(t("confirm.conflictWarning") + ` (${result.conflict})`);
        else toast.error(tCommon("error"));
        return;
      }
      toast.success(t("toast.rescheduled"));
      setRescheduleOpen(false);
      router.refresh();
    });
  }

  function handleCancel(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await cancelAppointmentAdminAction({ id, reason: form.get("reason") });
      toast[result.ok ? "success" : "error"](result.ok ? t("toast.cancelled") : tCommon("error"));
      if (result.ok) {
        setCancelOpen(false);
        router.refresh();
      }
    });
  }

  function handleComplete() {
    startTransition(async () => {
      const result = await completeAppointmentAction(id);
      toast[result.ok ? "success" : "error"](result.ok ? tCommon("success") : tCommon("error"));
      if (result.ok) router.refresh();
    });
  }

  function handleNoShow() {
    startTransition(async () => {
      const result = await markNoShowAction(id);
      toast[result.ok ? "success" : "error"](result.ok ? tCommon("success") : tCommon("error"));
      if (result.ok) router.refresh();
    });
  }

  function handleAssign(value: string) {
    setAssignee(value);
    startTransition(async () => {
      const result = await assignAppointmentAction({ id, assignedAdminId: value });
      toast[result.ok ? "success" : "error"](result.ok ? t("toast.assigned") : tCommon("error"));
      if (result.ok) router.refresh();
    });
  }

  const today = new Date().toISOString().slice(0, 10);
  const nowTime = new Date().toISOString().slice(11, 16);

  return (
    <div className="flex flex-col gap-4">
      {canApprove && (status === "PENDING" || status === "CONFIRMED" || status === "RESCHEDULED") && (
        <div className="flex flex-wrap gap-2">
          {status === "PENDING" && (
            <>
              <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <DialogTrigger asChild>
                  <Button variant="gold" size="sm">
                    <CheckCircle2 className="h-4 w-4" />
                    {t("actions.confirm")}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t("actions.confirm")}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleConfirm} className="mt-4 flex flex-col gap-4">
                    {conflictError && (
                      <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{conflictError}</p>
                    )}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label={t("form.date")} htmlFor="c-date" required>
                        <Input id="c-date" name="date" type="date" defaultValue={today} required />
                      </Field>
                      <Field label={t("form.time")} htmlFor="c-time" required>
                        <Input id="c-time" name="time" type="time" defaultValue={nowTime} required />
                      </Field>
                    </div>
                    <Field label={t("form.duration")} htmlFor="c-duration">
                      <Input id="c-duration" name="durationMin" type="number" min={15} max={240} step={15} defaultValue={30} />
                    </Field>
                    <Field label={t("detail.location")} htmlFor="c-location">
                      <Input id="c-location" name="location" />
                    </Field>
                    <Field label={t("detail.meetingLink")} htmlFor="c-link">
                      <Input id="c-link" name="meetingLink" dir="ltr" />
                    </Field>
                    <Field label={t("columns.assignee")} htmlFor="c-assignee">
                      <select
                        id="c-assignee"
                        name="assignedAdminId"
                        defaultValue={assignedAdminId ?? ""}
                        className="h-10 w-full rounded-xl border border-navy-200 bg-white px-3.5 text-sm text-navy-900 outline-none focus:border-gold-400 focus:ring-4 focus:ring-gold-100 dark:border-navy-700 dark:bg-navy-900 dark:text-white"
                      >
                        <option value="">{t("unassigned")}</option>
                        {admins.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.name}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button type="button" variant="outline">
                          {tCommon("cancel")}
                        </Button>
                      </DialogClose>
                      <Button type="submit" variant="gold" loading={isPending}>
                        {t("actions.save")}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>

              <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <XCircle className="h-4 w-4" />
                    {t("actions.reject")}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t("confirm.rejectTitle")}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleReject} className="mt-4 flex flex-col gap-4">
                    <Field label={t("confirm.rejectReasonLabel")} htmlFor="reject-reason" required>
                      <Textarea id="reject-reason" name="reason" rows={3} required />
                    </Field>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button type="button" variant="outline">
                          {tCommon("cancel")}
                        </Button>
                      </DialogClose>
                      <Button type="submit" variant="destructive" loading={isPending}>
                        {t("actions.reject")}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </>
          )}

          {(status === "CONFIRMED" || status === "RESCHEDULED") && canEdit && (
            <>
              <Button size="sm" variant="gold" onClick={handleComplete} disabled={isPending}>
                <CheckCircle2 className="h-4 w-4" />
                {t("actions.complete")}
              </Button>
              <Button size="sm" variant="outline" onClick={handleNoShow} disabled={isPending}>
                <UserCheck2 className="h-4 w-4" />
                {t("actions.markNoShow")}
              </Button>

              <Dialog open={rescheduleOpen} onOpenChange={setRescheduleOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    <CalendarClock className="h-4 w-4" />
                    {t("actions.reschedule")}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t("actions.reschedule")}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleReschedule} className="mt-4 flex flex-col gap-4">
                    {conflictError && (
                      <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{conflictError}</p>
                    )}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label={t("form.date")} htmlFor="r-date" required>
                        <Input id="r-date" name="date" type="date" defaultValue={today} required />
                      </Field>
                      <Field label={t("form.time")} htmlFor="r-time" required>
                        <Input id="r-time" name="time" type="time" defaultValue={nowTime} required />
                      </Field>
                    </div>
                    <Field label={t("form.duration")} htmlFor="r-duration">
                      <Input id="r-duration" name="durationMin" type="number" min={15} max={240} step={15} defaultValue={30} />
                    </Field>
                    <Field label={t("detail.messageToUser")} htmlFor="r-note">
                      <Textarea id="r-note" name="note" rows={2} />
                    </Field>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button type="button" variant="outline">
                          {tCommon("cancel")}
                        </Button>
                      </DialogClose>
                      <Button type="submit" variant="gold" loading={isPending}>
                        {t("actions.save")}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>

              <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="destructive">
                    <Ban className="h-4 w-4" />
                    {t("actions.cancel")}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t("confirm.cancelTitle")}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCancel} className="mt-4 flex flex-col gap-4">
                    <Field label={t("confirm.cancelReasonLabel")} htmlFor="cancel-reason" required>
                      <Textarea id="cancel-reason" name="reason" rows={3} required />
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
            </>
          )}
        </div>
      )}

      {canEdit && admins.length > 0 && (
        <div className="flex items-center justify-between rounded-xl border border-navy-100 p-3 dark:border-navy-800">
          <span className="text-sm font-semibold text-navy-700 dark:text-navy-200">{t("columns.assignee")}</span>
          <Select value={assignee} onValueChange={handleAssign}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder={t("unassigned")} />
            </SelectTrigger>
            <SelectContent>
              {admins.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {a.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
