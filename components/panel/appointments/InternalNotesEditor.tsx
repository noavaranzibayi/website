"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { updateInternalNotesAction } from "@/lib/actions/appointments";

export default function InternalNotesEditor({ id, initialNotes }: { id: string; initialNotes: string }) {
  const t = useTranslations("appointments.detail");
  const tCommon = useTranslations("panel.common");
  const [value, setValue] = useState(initialNotes);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    startTransition(async () => {
      const result = await updateInternalNotesAction({ id, internalNotes: value });
      toast[result.ok ? "success" : "error"](result.ok ? tCommon("success") : tCommon("error"));
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <Textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={t("internalNotesPlaceholder")}
        rows={4}
      />
      <Button size="sm" variant="outline" onClick={handleSave} loading={isPending} className="w-fit">
        {tCommon("save")}
      </Button>
    </div>
  );
}
