"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpLeft, Zap } from "lucide-react";
import { BookingStatusBadge } from "@/components/bookings/booking-status-badge";
import { staggerTight, fadeInUp } from "@/lib/motion";
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
      {/* Column rail — hidden on small screens where rows become stacked cards */}
      <div className="hidden grid-cols-[1.4fr_1.2fr_0.9fr_0.9fr_0.8fr_auto] gap-4 border-b border-[var(--hairline)] px-6 py-3.5 lg:grid">
        {["الضيف", "الفندق", "الوصول", "المغادرة", "التكلفة", "الحالة"].map((h) => (
          <span key={h} className="eyebrow">
            {h}
          </span>
        ))}
      </div>

      <motion.ul variants={staggerTight} initial="hidden" animate="show">
        {bookings.map((booking) => (
          <motion.li key={booking.id} variants={fadeInUp}>
            <Link
              href={`/bookings/${booking.id}`}
              className="row-interactive group grid grid-cols-1 gap-x-4 gap-y-2 border-b border-[var(--hairline)] px-6 py-4 last:border-0 lg:grid-cols-[1.4fr_1.2fr_0.9fr_0.9fr_0.8fr_auto] lg:items-center"
            >
              <div className="flex items-center gap-2.5">
                {booking.entry_type === "quick" && (
                  <span
                    className="flex size-5 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary"
                    title="حجز سريع"
                  >
                    <Zap className="size-3" />
                  </span>
                )}
                <span className="text-[14px] font-medium tracking-[-0.01em]">
                  {booking.guest_name}
                </span>
                <ArrowUpLeft className="size-3.5 text-muted-foreground opacity-0 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:opacity-100" />
              </div>

              <span className="text-[13px] text-muted-foreground">
                {booking.hotel_name ?? "—"}
              </span>

              <span className="text-[13px] tabular-nums text-muted-foreground">
                <span className="lg:hidden">الوصول: </span>
                {booking.check_in}
              </span>

              <span className="text-[13px] tabular-nums text-muted-foreground">
                <span className="lg:hidden">المغادرة: </span>
                {booking.check_out}
              </span>

              <span className="text-[13px] font-medium tabular-nums">
                {booking.total_cost.toLocaleString()}
              </span>

              <span className="justify-self-start lg:justify-self-end">
                <BookingStatusBadge status={booking.status} />
              </span>
            </Link>
          </motion.li>
        ))}
      </motion.ul>
    </div>
  );
}
