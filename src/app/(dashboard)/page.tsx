import Link from "next/link";
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Hotel,
  ListChecks,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { BookingStatusBadge } from "@/components/bookings/booking-status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardHomePage() {
  const supabase = await createClient();

  const [
    { count: totalBookings, error: bookingsError },
    { count: pendingCount },
    { count: sentCount },
    { count: hotelsCount },
    { data: recentBookings },
  ] = await Promise.all([
    supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .is("deleted_at", null),
    supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending")
      .is("deleted_at", null),
    supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("status", "sent")
      .is("deleted_at", null),
    supabase
      .from("hotels")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true),
    supabase
      .from("bookings")
      .select("id, guest_name, check_in, check_out, status, hotels(name)")
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  if (bookingsError) {
    return (
      <Alert variant="destructive">
        <AlertTriangle />
        <AlertTitle>تعذر الاتصال بقاعدة البيانات</AlertTitle>
        <AlertDescription>
          تأكد من ضبط متغيرات Supabase في ملف .env.local وتشغيل ملفات
          الهجرة (migrations). {bookingsError.message}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">لوحة التحكم</h1>
        <p className="text-sm text-muted-foreground">
          نظرة عامة على حالة الحجوزات والعمليات
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="إجمالي الحجوزات"
          value={totalBookings ?? 0}
          icon={ListChecks}
          accent="primary"
        />
        <StatCard
          label="قيد المراجعة"
          value={pendingCount ?? 0}
          icon={CalendarClock}
          accent="amber"
        />
        <StatCard
          label="تم إرسال البريد"
          value={sentCount ?? 0}
          icon={CheckCircle2}
          accent="green"
        />
        <StatCard
          label="الفنادق النشطة"
          value={hotelsCount ?? 0}
          icon={Hotel}
          accent="primary"
        />
      </div>

      <Card className="glass-panel">
        <CardHeader>
          <CardTitle>أحدث الحجوزات</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {!recentBookings || recentBookings.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              لا توجد حجوزات بعد.{" "}
              <Link href="/parse" className="text-primary underline">
                ابدأ بتحليل حجز جديد
              </Link>
            </p>
          ) : (
            recentBookings.map((booking) => (
              <Link
                key={booking.id}
                href={`/bookings/${booking.id}`}
                className="flex items-center justify-between rounded-lg border border-border/60 px-4 py-3 text-sm transition-colors hover:bg-accent/50"
              >
                <div>
                  <p className="font-medium">{booking.guest_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(booking.hotels as unknown as { name: string } | null)?.name ?? "—"} ·{" "}
                    {booking.check_in} → {booking.check_out}
                  </p>
                </div>
                <BookingStatusBadge status={booking.status} />
              </Link>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
