import Link from "next/link";
import { ChevronLeft, Inbox, ShieldCheck, Zap } from "lucide-react";
import { BookingStatusBadge } from "@/components/bookings/booking-status-badge";
import { cn } from "@/lib/utils";
import type { BookingEntryType, BookingStatus, UserRole } from "@/types/database.types";

export interface TeamMemberBooking {
  id: string;
  guest_name: string;
  hotel_name: string | null;
  check_in: string;
  check_out: string;
  status: BookingStatus;
  entry_type: BookingEntryType;
}

export interface TeamMember {
  id: string;
  full_name: string | null;
  role: UserRole;
  total_bookings: number;
  new_bookings: number;
  bookings: TeamMemberBooking[];
}

function initials(name: string | null) {
  if (!name) return "—";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

export function TeamMemberCard({ member, index = 0 }: { member: TeamMember; index?: number }) {
  const hasNew = member.new_bookings > 0;

  return (
    <article
      className="glass-panel animate-fade-in-up flex h-[460px] min-w-0 flex-col overflow-hidden"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      {/* Header */}
      <header className="flex items-start gap-3 border-b border-[var(--hairline)] px-4 py-4">
        <div
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-muted text-[14px] font-semibold text-foreground ring-1 ring-[var(--hairline)]"
          aria-hidden
        >
          {initials(member.full_name)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h2 className="truncate text-[15px] font-semibold tracking-[-0.014em]">
              {member.full_name || "—"}
            </h2>
            {member.role === "admin" && (
              <ShieldCheck className="size-3.5 shrink-0 text-chart-2" aria-label="مسؤول" />
            )}
          </div>
          <p className="mt-0.5 text-[12.5px] text-muted-foreground">
            <span className="font-medium tabular-nums text-foreground">
              {member.total_bookings.toLocaleString()}
            </span>{" "}
            إجمالي الحجوزات
          </p>
        </div>

        <span
          className={cn(
            "inline-flex h-6 shrink-0 items-center gap-1 rounded-full px-2.5 text-[11.5px] font-semibold tabular-nums",
            hasNew
              ? "bg-chart-3 text-white shadow-[0_6px_16px_-8px_var(--chart-3)]"
              : "border border-chart-3/25 bg-chart-3/10 text-chart-3",
          )}
          title="حجوزات جديدة قيد المراجعة"
        >
          {member.new_bookings.toLocaleString()}
          <span className="font-medium">جديد</span>
        </span>
      </header>

      {/* Body */}
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <span className="eyebrow">الحجوزات</span>
          {member.bookings.length > 0 && (
            <span className="text-[11px] tabular-nums text-muted-foreground">
              {member.bookings.length.toLocaleString()}
            </span>
          )}
        </div>

        {member.bookings.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 px-4 pb-6 text-center">
            <div className="flex size-10 items-center justify-center rounded-xl bg-muted/60">
              <Inbox className="size-4 text-muted-foreground" />
            </div>
            <p className="text-[12.5px] text-muted-foreground">لا توجد حجوزات لهذا العضو بعد.</p>
          </div>
        ) : (
          <ul className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 pb-2">
            {member.bookings.map((booking) => (
              <li key={booking.id}>
                <Link
                  href={`/bookings/${booking.id}`}
                  className="row-interactive group flex items-center gap-2 rounded-lg border-b border-[var(--hairline)] px-2 py-2.5 last:border-0 focus-visible:outline-2 focus-visible:outline-ring"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      {booking.entry_type === "quick" && (
                        <span
                          className="flex size-4 shrink-0 items-center justify-center rounded bg-primary/10 text-primary"
                          title="حجز سريع"
                        >
                          <Zap className="size-2.5" />
                        </span>
                      )}
                      <span className="truncate text-[13.5px] font-medium tracking-[-0.01em]">
                        {booking.guest_name}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-[12px] text-muted-foreground">
                      {booking.hotel_name ?? "—"}
                    </p>
                    <p
                      className="mt-0.5 truncate text-[11.5px] tabular-nums text-muted-foreground/80"
                      dir="ltr"
                      style={{ textAlign: "right" }}
                    >
                      {booking.check_in} → {booking.check_out}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <BookingStatusBadge status={booking.status} />
                    <ChevronLeft className="size-4 text-muted-foreground transition-transform duration-300 group-hover:-translate-x-0.5" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}
