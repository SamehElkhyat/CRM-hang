import { Badge } from "@/components/ui/badge";
import { BOOKING_STATUS_LABELS } from "@/lib/booking-status-labels";
import type { BookingStatus } from "@/types/database.types";

const STATUS_STYLE: Record<BookingStatus, { chip: string; dot: string }> = {
  pending: {
    chip: "border-chart-4/25 bg-chart-4/10 text-chart-4",
    dot: "bg-chart-4",
  },
  confirmed: {
    chip: "border-chart-2/25 bg-chart-2/10 text-chart-2",
    dot: "bg-chart-2",
  },
  sent: {
    chip: "border-chart-3/25 bg-chart-3/10 text-chart-3",
    dot: "bg-chart-3",
  },
  cancelled: {
    chip: "border-destructive/25 bg-destructive/10 text-destructive",
    dot: "bg-destructive",
  },
};

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const { chip, dot } = STATUS_STYLE[status];
  return (
    <Badge variant="outline" className={chip}>
      <span className={`size-1.5 rounded-full ${dot}`} aria-hidden />
      {BOOKING_STATUS_LABELS[status]}
    </Badge>
  );
}
