import Link from "next/link";
import {
  ArrowLeft,
  Briefcase,
  CalendarDays,
  ChevronLeft,
  ShieldCheck,
  Zap,
} from "lucide-react";
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

// How many of the member's most recent bookings the card previews. The full
// list is one click away through "عرض كل الحجوزات".
const PREVIEW_LIMIT = 3;

// Each member keeps the same identity colour everywhere (top edge + avatar).
// Drawn only from the existing brand palette, and never green or amber:
// those already mean "new" and "pending" on this card.
const MEMBER_TONES = [
  { edge: "border-t-primary", avatar: "bg-primary/10 text-primary" },
  { edge: "border-t-chart-1", avatar: "bg-chart-1/10 text-chart-1" },
  { edge: "border-t-chart-5", avatar: "bg-chart-5/10 text-chart-5" },
  { edge: "border-t-chart-2", avatar: "bg-chart-2/10 text-chart-2" },
] as const;

function toneFor(id: string) {
  let hash = 0;
  for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return MEMBER_TONES[hash % MEMBER_TONES.length];
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
      <span
        aria-hidden
        className={cn("size-1.5 rounded-full", count > 0 ? "bg-background" : "bg-muted-foreground")}
      />
      {count.toLocaleString()}
      <span aria-hidden>جديد</span>
    </span>
  );
}

export function TeamMemberCard({ member }: { member: TeamMember }) {
  const tone = toneFor(member.id);
  const name = member.full_name || "بدون اسم";
  const allBookingsHref = `/team/${member.id}/bookings`;
  const preview = member.bookings.slice(0, PREVIEW_LIMIT);
  const focusRing =
    "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring";

  return (
    <article
      className={cn(
        "flex h-full min-w-0 flex-col overflow-hidden rounded-xl border border-t-4 border-[var(--hairline)] bg-card shadow-[0_1px_2px_rgb(0_0_0_/_0.06)]",
        tone.edge,
      )}
    >
      {/* Header: who this is and their workload. */}
      <Link
        href={allBookingsHref}
        title={`عرض كل حجوزات ${name}`}
        className={cn(
          "group flex items-start gap-3 p-4 transition-colors duration-150 ease-out hover:bg-muted/50 motion-reduce:transition-none",
          focusRing,
        )}
      >
        <span
          aria-hidden
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-full text-base font-semibold",
            tone.avatar,
          )}
        >
          {initials(member.full_name)}
        </span>

        <div className="min-w-0 flex-1">
          <h3 className="flex items-center gap-1 text-base font-semibold tracking-[-0.014em]">
            <span className="truncate underline-offset-4 group-hover:underline">{name}</span>
            {member.role === "admin" && (
              <>
                <ShieldCheck className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                <span className="sr-only">مسؤول</span>
              </>
            )}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            <span className="tabular-nums">{member.total_bookings.toLocaleString()}</span> حجز
            إجمالاً
          </p>
        </div>

        <NewBookingsCount count={member.new_bookings} />
      </Link>

      {/* Section label with the count of bookings listed. */}
      <div className="flex items-center justify-between gap-2 border-y border-[var(--hairline)] bg-muted/40 px-4 py-2">
        <span className="flex items-center gap-2 text-sm font-semibold">
          <Briefcase className="size-4 text-muted-foreground" aria-hidden />
          الحجوزات
        </span>
        <span className="rounded-full bg-muted px-2 text-xs font-medium tabular-nums text-muted-foreground">
          {member.bookings.length.toLocaleString()}
        </span>
      </div>

      {/* Booking items. */}
      {preview.length === 0 ? (
        <p className="flex-1 px-4 py-8 text-sm text-muted-foreground">
          لا توجد حجوزات لهذا العضو بعد.
        </p>
      ) : (
        <ul className="flex-1 divide-y divide-[var(--hairline)]">
          {preview.map((booking) => (
            <li key={booking.id}>
              <Link
                href={`/bookings/${booking.id}`}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 transition-colors duration-150 ease-out hover:bg-muted/50 motion-reduce:transition-none",
                  focusRing,
                )}
              >
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1 text-sm font-semibold">
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
                  <p className="mt-1 flex items-center gap-1 text-xs tabular-nums text-muted-foreground">
                    <CalendarDays className="size-3 shrink-0" aria-hidden />
                    <span dir="ltr" className="truncate">
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

      {/* Footer action. */}
      <Link
        href={allBookingsHref}
        className={cn(
          "flex items-center justify-center gap-1 border-t border-[var(--hairline)] px-4 py-3 text-sm font-medium text-primary transition-colors duration-150 ease-out hover:bg-muted/50 motion-reduce:transition-none",
          focusRing,
        )}
      >
        عرض كل الحجوزات
        {member.bookings.length > PREVIEW_LIMIT && (
          <span className="tabular-nums text-muted-foreground">
            ({member.bookings.length.toLocaleString()})
          </span>
        )}
        <ArrowLeft className="size-4" aria-hidden />
      </Link>
    </article>
  );
}
