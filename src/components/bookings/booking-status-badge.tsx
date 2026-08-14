import { Badge } from "@/components/ui/badge";
import type { BookingStatus } from "@/types/database.types";

const STATUS_CONFIG: Record<
  BookingStatus,
  { label: string; className: string }
> = {
  pending: {
    label: "قيد المراجعة",
    className: "bg-chart-4/15 text-chart-4 border-chart-4/30",
  },
  confirmed: {
    label: "مؤكد",
    className: "bg-chart-2/15 text-chart-2 border-chart-2/30",
  },
  sent: {
    label: "تم الإرسال",
    className: "bg-chart-3/15 text-chart-3 border-chart-3/30",
  },
  cancelled: {
    label: "ملغى",
    className: "bg-destructive/10 text-destructive border-destructive/30",
  },
};

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}
