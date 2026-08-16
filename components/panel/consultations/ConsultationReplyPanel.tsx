"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { closeConsultationAction, replyConsultationAction } from "@/lib/actions/consultations";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function ConsultationReplyPanel({
  threadId,
  isClosed,
}: {
  threadId: string;
  isClosed: boolean;
}) {
  const t = useTranslations("consultations");
  const tCommon = useTranslations("panel.common");
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await replyConsultationAction({ threadId, message });

      if (!result.ok) {
        setError(tCommon("error"));
        return;
      }

      setMessage("");
      toast.success(t("toast.replied"));
      router.refresh();
    });
  }

  function handleClose() {
    setError(null);

    startTransition(async () => {
      const result = await closeConsultationAction({ threadId });

      if (!result.ok) {
        setError(tCommon("error"));
        return;
      }

      toast.success(t("toast.closed"));
      router.refresh();
    });
  }

  return (
    <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-sm dark:border-navy-800 dark:bg-navy-900">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-navy-800 dark:text-white">{t("detail.replyTitle")}</h3>
          {isClosed && <p className="mt-1 text-sm text-navy-400">{t("detail.closedDescription")}</p>}
        </div>
        {!isClosed && (
          <Button type="button" variant="outline" onClick={handleClose} loading={isPending}>
            {t("actions.close")}
          </Button>
        )}
      </div>

      {error && <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      {!isClosed && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={5}
            placeholder={t("detail.replyPlaceholder")}
            required
          />
          <div className="flex justify-end">
            <Button type="submit" variant="gold" loading={isPending}>
              {t("actions.reply")}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}