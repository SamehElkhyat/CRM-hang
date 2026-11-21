import Link from "next/link";
import { ArrowUpLeft, Zap } from "lucide-react";
import { BookingStatusBadge } from "@/components/bookings/booking-status-badge";
import type { BookingEntryType, BookingStatus } from "@/types/database.types";

export interface BookingRow {
  id: string;
  guest_name: string;
  check_in: string;
  check_out: string;
  status: BookingStatus;
  total_cost: number;
  hotel_name: string | null;
  entry_type?: BookingEntryType;
}

export function BookingsTable({ bookings }: { bookings: BookingRow[] }) {
  return (
    <div className="glass-panel overflow-hidden">
      {/* Column headings; on small screens each row stacks instead. */}
      <div className="hidden grid-cols-[1.4fr_1.2fr_0.9fr_0.9fr_0.8fr_auto] gap-4 border-b border-[var(--hairline)] px-6 py-3.5 lg:grid">
        {["الضيف", "الفندق", "الوصول", "المغادرة", "التكلفة", "الحالة"].map((h) => (
          <span key={h} className="eyebrow">
            {h}
          </span>
        ))}
      </div>

      <ul>
        {bookings.map((booking) => (
          <li key={booking.id}>
            <Link
              href={`/bookings/${booking.id}`}
              className="row-interactive group grid grid-cols-1 gap-x-4 gap-y-2 border-b border-[var(--hairline)] px-6 py-4 last:border-0 lg:grid-cols-[1.4fr_1.2fr_0.9fr_0.9fr_0.8fr_auto] lg:items-center"
            >
              <div className="flex items-center gap-2.5">
                {booking.entry_type === "quick" && (
                  <span className="shrink-0 text-primary" title="حجز سريع">
                    <Zap className="size-4" aria-hidden />
                    <span className="sr-only">حجز سريع</span>
                  </span>
                )}
                <span className="text-sm font-medium tracking-[-0.01em]">
                  {booking.guest_name}
                </span>
                <ArrowUpLeft className="size-4 text-muted-foreground opacity-0 transition-opacity duration-150 ease-out group-hover:opacity-100" aria-hidden />
              </div>

              <span className="text-sm text-muted-foreground">
                {booking.hotel_name ?? "فندق غير محدد"}
              </span>

              <span className="text-sm tabular-nums text-muted-foreground">
                <span className="lg:hidden">الوصول: </span>
                {booking.check_in}
              </span>

              <span className="text-sm tabular-nums text-muted-foreground">
                <span className="lg:hidden">المغادرة: </span>
                {booking.check_out}
              </span>

              <span className="text-sm font-medium tabular-nums">
                {booking.total_cost.toLocaleString()}
              </span>

              <span className="justify-self-start lg:justify-self-end">
                <BookingStatusBadge status={booking.status} />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
