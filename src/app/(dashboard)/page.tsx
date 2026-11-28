import Link from "next/link";
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  Hotel,
  ListChecks,
  Plus,
  Zap,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { PageHeader } from "@/components/layout/page-header";
import { buttonVariants } from "@/components/ui/button";
import { BookingStatusBadge } from "@/components/bookings/booking-status-badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TeamBoard } from "@/components/team/team-board";
import { getCurrentUser } from "@/lib/auth/get-current-profile";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardHomePage() {
  const supabase = await createClient();

  const [
    { count: totalBookings, error: bookingsError },
    { count: pendingCount },
    { count: sentCount },
    { count: hotelsCount },
    { data: recentBookings },
    user,
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
    getCurrentUser(),
  ]);

  const isAdmin = user?.profile?.role === "admin";

  if (bookingsError) {
    return (
      <Alert variant="destructive">
        <AlertTriangle />
        <AlertTitle>تعذر الاتصال بقاعدة البيانات</AlertTitle>
        <AlertDescription>
          تأكد من ضبط متغيرات Supabase في ملف .env.local وتشغيل ملفات الهجرة
          (migrations). {bookingsError.message}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="الرئيسية"
        description="اضغط على أي حجز لفتحه، أو ابدأ حجز جديد."
        actions={
          <>
            <Link href="/bookings/quick" className={buttonVariants({ variant: "outline", size: "lg" })}>
              <Zap aria-hidden />
              حجز سريع
            </Link>
            <Link href="/bookings/new" className={buttonVariants({ size: "lg" })}>
              <Plus aria-hidden />
              حجز جديد
            </Link>
          </>
        }
      />

      {isAdmin && <TeamBoard />}

      <section aria-label="ملخص الأرقام" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="إجمالي الحجوزات" value={totalBookings ?? 0} icon={ListChecks} />
        <StatCard label="قيد المراجعة" value={pendingCount ?? 0} icon={CalendarClock} />
        <StatCard label="تم إرسال البريد" value={sentCount ?? 0} icon={CheckCircle2} />
        <StatCard label="الفنادق النشطة" value={hotelsCount ?? 0} icon={Hotel} />
      </section>

      <section aria-labelledby="recent-bookings-title">
        <div className="mb-4 flex items-baseline justify-between gap-4">
          <h2 id="recent-bookings-title" className="text-lg font-semibold tracking-[-0.02em]">
            أحدث الحجوزات
          </h2>
          <Link
            href="/bookings"
            className="text-sm text-muted-foreground transition-colors duration-150 ease-out hover:text-foreground"
          >
            عرض كل الحجوزات
          </Link>
        </div>

        <div className="glass-panel overflow-hidden">
          {!recentBookings || recentBookings.length === 0 ? (
            <p className="px-6 py-12 text-sm text-muted-foreground">
              لا توجد حجوزات بعد.{" "}
              <Link href="/bookings/new" className="text-foreground underline underline-offset-4">
                أضف أول حجز
              </Link>
            </p>
          ) : (
            <ul className="divide-y divide-[var(--hairline)]">
              {recentBookings.map((booking) => (
                <li key={booking.id}>
                  <Link
                    href={`/bookings/${booking.id}`}
                    className="row-interactive flex items-center justify-between gap-4 px-6 py-4 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium tracking-[-0.01em]">
                        {booking.guest_name}
                      </p>
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {(booking.hotels as unknown as { name: string } | null)?.name ??
                          "فندق غير محدد"}
                        {" · "}
                        <span dir="ltr">
                          {booking.check_in} → {booking.check_out}
                        </span>
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <BookingStatusBadge status={booking.status} />
                      <ChevronLeft className="size-4 text-muted-foreground" aria-hidden />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
