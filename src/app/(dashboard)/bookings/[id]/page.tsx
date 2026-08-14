import Link from "next/link";
import { notFound } from "next/navigation";
import { Mail, Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookingStatusSelect } from "@/components/bookings/booking-status-select";
import { CostBreakdownTable } from "@/components/bookings/cost-breakdown-table";
import { AuditLogTimeline } from "@/components/bookings/audit-log-timeline";
import { createClient } from "@/lib/supabase/server";
import { calculateBookingCost } from "@/lib/cost/calculate-cost";
import type { ChildPolicy } from "@/types/database.types";

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

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

  const { count: draftCount } = await supabase
    .from("email_drafts")
    .select("*", { count: "exact", head: true })
    .eq("booking_id", id);

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
          <BookingStatusSelect bookingId={booking.id} status={booking.status} />
          <Button render={<Link href={`/bookings/${booking.id}/email`} />}>
            <Mail />
            استوديو البريد
            {draftCount ? <Badge variant="secondary">{draftCount}</Badge> : null}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
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
  );
}
