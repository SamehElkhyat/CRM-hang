import Link from "next/link";
import { ChevronLeft, ShieldCheck, Zap } from "lucide-react";
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
  if (!name) return "؟";
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function NewBookingsCount({ count }: { count: number }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 shrink-0 items-center gap-1 rounded-full px-2 text-xs font-semibold tabular-nums",
        count > 0 ? "bg-chart-3 text-background" : "bg-muted text-muted-foreground",
      )}
      aria-label={`${count} حجز جديد قيد المراجعة`}
      title="حجوزات جديدة قيد المراجعة"
    >
      {count.toLocaleString()}
      <span aria-hidden>جديد</span>
    </span>
  );
}

export function TeamMemberCard({ member }: { member: TeamMember }) {
  return (
    <article className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-[var(--hairline)] bg-card">
      <header className="flex items-start gap-3 border-b border-[var(--hairline)] p-4">
        <span
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold"
          aria-hidden
        >
          {initials(member.full_name)}
        </span>

        <div className="min-w-0 flex-1">
          <h3 className="flex items-center gap-1 text-base font-semibold tracking-[-0.014em]">
            <span className="truncate">{member.full_name || "بدون اسم"}</span>
            {member.role === "admin" && (
              <>
                <ShieldCheck className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                <span className="sr-only">مسؤول</span>
              </>
            )}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            <span className="font-medium tabular-nums text-foreground">
              {member.total_bookings.toLocaleString()}
            </span>{" "}
            حجز إجمالاً
          </p>
        </div>

        <NewBookingsCount count={member.new_bookings} />
      </header>

      {member.bookings.length === 0 ? (
        <p className="px-4 py-8 text-sm text-muted-foreground">لا توجد حجوزات لهذا العضو بعد.</p>
      ) : (
        <ul className="max-h-80 divide-y divide-[var(--hairline)] overflow-y-auto overscroll-contain">
          {member.bookings.map((booking) => (
            <li key={booking.id}>
              <Link
                href={`/bookings/${booking.id}`}
                className="flex items-center gap-3 px-4 py-3 transition-colors duration-150 ease-out hover:bg-muted/60 focus-visible:bg-muted/60 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none"
              >
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1 text-sm font-medium">
                    {booking.entry_type === "quick" && (
                      <>
                        <Zap className="size-4 shrink-0 text-primary" aria-hidden />
                        <span className="sr-only">حجز سريع: </span>
                      </>
                    )}
                    <span className="truncate">{booking.guest_name}</span>
                  </p>
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {booking.hotel_name ?? "فندق غير محدد"}
                  </p>
                  <p className="mt-1 truncate text-xs tabular-nums text-muted-foreground">
                    <span dir="ltr">
                      {booking.check_in} → {booking.check_out}
                    </span>
                  </p>
                </div>
                <BookingStatusBadge status={booking.status} className="text-xs" />
                <ChevronLeft className="size-4 shrink-0 text-muted-foreground" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
