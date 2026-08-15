import { Badge } from "@/components/ui/badge";
import { BOOKING_STATUS_LABELS } from "@/lib/booking-status-labels";
import type { BookingStatus } from "@/types/database.types";

const STATUS_CLASSNAME: Record<BookingStatus, string> = {
  pending: "bg-chart-4/15 text-chart-4 border-chart-4/30",
  confirmed: "bg-chart-2/15 text-chart-2 border-chart-2/30",
  sent: "bg-chart-3/15 text-chart-3 border-chart-3/30",
  cancelled: "bg-destructive/10 text-destructive border-destructive/30",
};

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  return (
    <Badge variant="outline" className={STATUS_CLASSNAME[status]}>
      {BOOKING_STATUS_LABELS[status]}
    </Badge>
  );
}
