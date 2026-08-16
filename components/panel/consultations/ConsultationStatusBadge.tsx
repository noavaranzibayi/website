import type { ConsultationStatus } from "@/app/generated/prisma/client";
import { Badge } from "@/components/ui/badge";

const STATUS_VARIANT: Record<ConsultationStatus, "warning" | "info" | "neutral"> = {
  OPEN: "warning",
  ANSWERED: "info",
  CLOSED: "neutral",
};

export default function ConsultationStatusBadge({
  status,
  label,
}: {
  status: ConsultationStatus;
  label: string;
}) {
  return <Badge variant={STATUS_VARIANT[status]}>{label}</Badge>;
}