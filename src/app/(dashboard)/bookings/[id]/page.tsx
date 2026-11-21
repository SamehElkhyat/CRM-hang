import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Mail, Phone, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookingStatusSelect } from "@/components/bookings/booking-status-select";
import { BookingStatusBadge } from "@/components/bookings/booking-status-badge";
import { CostBreakdownTable } from "@/components/bookings/cost-breakdown-table";
import { AuditLogTimeline } from "@/components/bookings/audit-log-timeline";
import { CommentThread, type CommentWithAuthor } from "@/components/bookings/comment-thread";
import { FollowToggle } from "@/components/bookings/follow-toggle";
import { BookingAttachments } from "@/components/bookings/booking-attachments";
import type { AttachmentWithUploader } from "@/components/bookings/attachments-list";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/get-current-profile";
import { calculateBookingCost } from "@/lib/cost/calculate-cost";
import type { ChildPolicy } from "@/types/database.types";

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [supabase, currentUser] = await Promise.all([createClient(), getCurrentUser()]);

  const { data: booking } = await supabase
    .from("bookings")
    .select(
      "*, hotels(id, name, reservation_email, sales_email, finance_email, hotline, child_policy)",
    )
    .eq("id", id)
    .single();

  if (!booking) notFound();

  const hotel = booking.hotels as unknown as {
    id: string;
    name: string;
    reservation_email: string | null;
    sales_email: string | null;
    finance_email: string | null;
    hotline: string | null;
    child_policy: ChildPolicy;
  } | null;

  const [{ count: draftCount }, { data: commentsRaw }, { data: followRow }, { data: attachmentsRaw }] =
    await Promise.all([
      supabase.from("email_drafts").select("*", { count: "exact", head: true }).eq("booking_id", id),
      supabase
        .from("booking_comments")
        .select("id, booking_id, author_id, message, is_system, created_at, profiles(full_name)")
        .eq("booking_id", id)
        .order("created_at", { ascending: true }),
      currentUser
        ? supabase
            .from("booking_followers")
            .select("booking_id")
            .eq("booking_id", id)
            .eq("user_id", currentUser.id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
      supabase
        .from("booking_attachments")
        .select("id, file_name, file_path, file_type, file_size, created_at, profiles(full_name)")
        .eq("booking_id", id)
        .order("created_at", { ascending: false }),
    ]);

  const comments: CommentWithAuthor[] = (commentsRaw ?? []).map((c) => ({
    id: c.id,
    booking_id: c.booking_id,
    author_id: c.author_id,
    message: c.message,
    is_system: c.is_system,
    created_at: c.created_at,
    author_name:
      (c.profiles as unknown as { full_name: string | null } | null)?.full_name ?? null,
  }));

  const attachments: AttachmentWithUploader[] = (attachmentsRaw ?? []).map((a) => ({
    id: a.id,
    file_name: a.file_name,
    file_path: a.file_path,
    file_type: a.file_type,
    file_size: a.file_size,
    created_at: a.created_at,
    uploader_name:
      (a.profiles as unknown as { full_name: string | null } | null)?.full_name ?? null,
  }));

  let cost = null;
  try {
    cost = calculateBookingCost({
      checkIn: booking.check_in,
      checkOut: booking.check_out,
      baseRate: booking.rate,
      childrenAges: booking.children_ages,
      childPolicy: hotel?.child_policy ?? {},
    });
  } catch {
    cost = null;
  }

  const detailRows = [
    { label: "فئة الغرفة", value: booking.room_category || "غير محدد" },
    { label: "نظام الإعاشة", value: booking.meal_plan || "غير محدد" },
    { label: "رقم هاتف الضيف", value: booking.guest_phone || "غير متوفر", ltr: true },
    {
      label: "أعمار الأطفال",
      value: booking.children_ages.length > 0 ? booking.children_ages.join(", ") : "لا يوجد",
    },
  ];

  const contactRows = [
    { icon: Phone, value: hotel?.hotline || "غير متوفر", tag: "الخط الساخن" },
    { icon: Mail, value: hotel?.reservation_email || "غير متوفر", tag: "حجوزات" },
    { icon: Mail, value: hotel?.sales_email || "غير متوفر", tag: "مبيعات" },
  ];

  const isQuick = booking.entry_type === "quick";

  const contentCard = (
    <div className="glass-panel overflow-hidden">
      <h2 className="border-b border-[var(--hairline)] px-5 py-3 text-sm font-semibold">
        {isQuick ? "النص الملصوق" : "الوصف / ملاحظات"}
      </h2>
      <div className="p-5">
        <pre
          dir="rtl"
          className="whitespace-pre-wrap rounded-lg border border-[var(--hairline)] bg-muted/40 p-4 font-sans text-sm leading-[1.9]"
        >
          {booking.raw_arabic_text}
        </pre>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div className="min-w-0">
          <Link
            href="/bookings"
            className="eyebrow inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
          >
            <ArrowRight className="size-3" />
            الحجوزات
          </Link>
          <div className="mt-2 flex items-center gap-2">
            <h1 className="truncate text-2xl font-semibold tracking-[-0.03em] lg:text-display">
              {booking.guest_name}
            </h1>
            {isQuick && (
              <Badge
                variant="outline"
                className="border-primary/25 bg-primary/10 text-primary"
              >
                <Zap className="size-3" />
                حجز سريع
              </Badge>
            )}
          </div>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {isQuick ? (
              <span className="tabular-nums">
                أُضيف في {new Date(booking.created_at).toLocaleDateString("ar-EG")}
              </span>
            ) : (
              <>
                {hotel?.name ?? "فندق غير محدد"} ·{" "}
                <span className="tabular-nums">
                  {booking.check_in} → {booking.check_out}
                </span>
              </>
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <FollowToggle bookingId={booking.id} initialFollowing={Boolean(followRow)} />
          {currentUser?.profile?.role === "admin" ? (
            <BookingStatusSelect bookingId={booking.id} status={booking.status} />
          ) : (
            <BookingStatusBadge status={booking.status} />
          )}
          <Button
            render={<Link href={`/bookings/${booking.id}/email`} />}
          >
            <Mail />
            استوديو البريد
            {draftCount ? <Badge variant="secondary">{draftCount}</Badge> : null}
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px] lg:items-start">
        <div className="flex flex-col gap-6">
          {isQuick && contentCard}

          {!isQuick && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="glass-panel overflow-hidden">
                <h2 className="border-b border-[var(--hairline)] px-5 py-3 text-sm font-semibold">
                  تفاصيل الحجز
                </h2>
                <dl className="flex flex-col">
                  {detailRows.map((row) => (
                    <div
                      key={row.label}
                      className="flex items-baseline justify-between gap-4 border-b border-[var(--hairline)] px-5 py-3 last:border-0"
                    >
                      <dt className="text-xs text-muted-foreground">{row.label}</dt>
                      <dd
                        dir={row.ltr ? "ltr" : undefined}
                        className="text-sm font-medium"
                      >
                        {row.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="glass-panel overflow-hidden">
                <h2 className="border-b border-[var(--hairline)] px-5 py-3 text-sm font-semibold">
                  التواصل مع الفندق
                </h2>
                <div className="flex flex-col">
                  {contactRows.map((row, i) => {
                    const Icon = row.icon;
                    return (
                      <div
                        key={i}
                        className="flex items-center gap-3 border-b border-[var(--hairline)] px-5 py-3 last:border-0"
                      >
                        <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                        <span dir="ltr" className="min-w-0 flex-1 truncate text-start text-sm">
                          {row.value}
                        </span>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {row.tag}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {cost && !isQuick && (
            <div className="glass-panel overflow-hidden">
              <h2 className="border-b border-[var(--hairline)] px-5 py-3 text-sm font-semibold">
                تفاصيل التكلفة
              </h2>
              <div className="px-5 py-2">
                <CostBreakdownTable
                  cost={cost}
                  currency={hotel?.child_policy?.currency ?? "EGP"}
                />
              </div>
            </div>
          )}

          {!isQuick && contentCard}

          <BookingAttachments
            bookingId={booking.id}
            attachments={attachments}
            currentUserName={currentUser?.profile?.full_name ?? null}
          />

          <AuditLogTimeline bookingId={booking.id} />
        </div>

        {currentUser && (
          <div className="lg:sticky lg:top-20">
            <CommentThread
              bookingId={booking.id}
              currentUserId={currentUser.id}
              initialComments={comments}
            />
          </div>
        )}
      </div>
    </div>
  );
}
