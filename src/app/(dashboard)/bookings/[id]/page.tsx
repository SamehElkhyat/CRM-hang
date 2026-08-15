import Link from "next/link";
import { notFound } from "next/navigation";
import { Mail, Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookingStatusSelect } from "@/components/bookings/booking-status-select";
import { CostBreakdownTable } from "@/components/bookings/cost-breakdown-table";
import { AuditLogTimeline } from "@/components/bookings/audit-log-timeline";
import { CommentThread, type CommentWithAuthor } from "@/components/bookings/comment-thread";
import { FollowToggle } from "@/components/bookings/follow-toggle";
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

  const [{ count: draftCount }, { data: commentsRaw }, { data: followRow }] = await Promise.all([
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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{booking.guest_name}</h1>
          <p className="text-sm text-muted-foreground">
            {hotel?.name ?? "—"} · {booking.check_in} → {booking.check_out}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <FollowToggle bookingId={booking.id} initialFollowing={Boolean(followRow)} />
          <BookingStatusSelect bookingId={booking.id} status={booking.status} />
          <Button render={<Link href={`/bookings/${booking.id}/email`} />}>
            <Mail />
            استوديو البريد
            {draftCount ? <Badge variant="secondary">{draftCount}</Badge> : null}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Card className="glass-panel">
              <CardHeader>
                <CardTitle>تفاصيل الحجز</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-1.5 text-sm">
                <p>
                  <span className="text-muted-foreground">فئة الغرفة: </span>
                  {booking.room_category || "—"}
                </p>
                <p>
                  <span className="text-muted-foreground">نظام الإعاشة: </span>
                  {booking.meal_plan || "—"}
                </p>
                <p>
                  <span className="text-muted-foreground">رقم هاتف الضيف: </span>
                  {booking.guest_phone || "—"}
                </p>
                <p>
                  <span className="text-muted-foreground">أعمار الأطفال: </span>
                  {booking.children_ages.length > 0 ? booking.children_ages.join(", ") : "—"}
                </p>
              </CardContent>
            </Card>

            <Card className="glass-panel">
              <CardHeader>
                <CardTitle>بيانات التواصل مع الفندق</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-1.5 text-sm">
                <p className="flex items-center gap-1.5">
                  <Phone className="size-3.5 text-muted-foreground" />
                  {hotel?.hotline || "—"}
                </p>
                <p className="flex items-center gap-1.5">
                  <Mail className="size-3.5 text-muted-foreground" />
                  {hotel?.reservation_email || "—"} (حجوزات)
                </p>
                <p className="flex items-center gap-1.5">
                  <Mail className="size-3.5 text-muted-foreground" />
                  {hotel?.sales_email || "—"} (مبيعات)
                </p>
              </CardContent>
            </Card>
          </div>

          {cost && (
            <Card className="glass-panel">
              <CardHeader>
                <CardTitle>تفاصيل التكلفة</CardTitle>
              </CardHeader>
              <CardContent>
                <CostBreakdownTable cost={cost} currency={hotel?.child_policy?.currency ?? "EGP"} />
              </CardContent>
            </Card>
          )}

          <Card className="glass-panel">
            <CardHeader>
              <CardTitle>النص الأصلي للحجز</CardTitle>
            </CardHeader>
            <CardContent>
              <pre
                dir="rtl"
                className="whitespace-pre-wrap rounded-lg bg-muted/50 p-4 text-sm leading-relaxed"
              >
                {booking.raw_arabic_text}
              </pre>
            </CardContent>
          </Card>

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
