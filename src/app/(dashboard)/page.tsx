import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpLeft,
  CalendarClock,
  CheckCircle2,
  Hotel,
  ListChecks,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { BookingStatusBadge } from "@/components/bookings/booking-status-badge";
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
          تأكد من ضبط متغيرات Supabase في ملف .env.local وتشغيل ملفات الهجرة
          (migrations). {bookingsError.message}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="animate-fade-in-up flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">نظرة عامة</p>
          <h1 className="mt-2 text-[2rem] font-semibold tracking-[-0.03em] lg:text-[2.5rem]">
            لوحة التحكم
          </h1>
          <p className="mt-1.5 max-w-md text-[13.5px] leading-relaxed text-muted-foreground">
            حالة الحجوزات والعمليات في الوقت الحالي
          </p>
        </div>
        <Link
          href="/parse"
          className="group inline-flex items-center gap-2 border-b border-[var(--hairline-strong)] pb-1 text-[13.5px] font-medium transition-colors hover:border-foreground"
        >
          تحليل حجز جديد
          <ArrowUpLeft className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:-translate-x-0.5" />
        </Link>
      </header>

      {/* Asymmetric: featured metric holds the left column at full height,
          the three supporting metrics stack in a 2-up beside it. */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <StatCard
            label="إجمالي الحجوزات"
            value={totalBookings ?? 0}
            icon={ListChecks}
            accent="primary"
            index={0}
            featured
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-7 lg:grid-cols-2">
          <StatCard
            label="قيد المراجعة"
            value={pendingCount ?? 0}
            icon={CalendarClock}
            accent="amber"
            index={1}
          />
          <StatCard
            label="تم إرسال البريد"
            value={sentCount ?? 0}
            icon={CheckCircle2}
            accent="green"
            index={2}
          />
          <StatCard
            label="الفنادق النشطة"
            value={hotelsCount ?? 0}
            icon={Hotel}
            accent="primary"
            index={3}
          />
          <Link
            href="/bookings"
            className="stat-tile animate-fade-in-up group flex flex-col justify-between gap-6 p-5"
            style={{ animationDelay: "280ms" }}
          >
            <div className="stat-tile-blob bg-foreground/40" aria-hidden />
            <div className="relative z-10 flex size-10 items-center justify-center rounded-xl bg-foreground/8 text-foreground transition-transform duration-500 group-hover:scale-105">
              <ArrowUpLeft className="size-[18px] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:-translate-x-0.5" />
            </div>
            <div className="relative z-10">
              <p className="text-[15px] font-semibold tracking-[-0.015em]">
                كل الحجوزات
              </p>
              <p className="mt-1 text-[13px] text-muted-foreground">
                عرض السجل الكامل
              </p>
            </div>
          </Link>
        </div>
      </section>

      <section className="animate-fade-in-up" style={{ animationDelay: "340ms" }}>
        <div className="mb-4 flex items-baseline justify-between gap-4">
          <h2 className="text-lg font-semibold tracking-[-0.02em]">أحدث الحجوزات</h2>
          <Link
            href="/bookings"
            className="text-[13px] text-muted-foreground transition-colors hover:text-foreground"
          >
            عرض الكل
          </Link>
        </div>

        <div className="glass-panel overflow-hidden">
          {!recentBookings || recentBookings.length === 0 ? (
            <p className="px-6 py-14 text-center text-[13.5px] text-muted-foreground">
              لا توجد حجوزات بعد.{" "}
              <Link href="/parse" className="text-foreground underline underline-offset-4">
                ابدأ بتحليل حجز جديد
              </Link>
            </p>
          ) : (
            <ul>
              {recentBookings.map((booking, i) => (
                <li key={booking.id}>
                  <Link
                    href={`/bookings/${booking.id}`}
                    className="row-interactive group flex items-center justify-between gap-4 border-b border-[var(--hairline)] px-6 py-4 last:border-0"
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <span className="w-6 shrink-0 text-[11px] tabular-nums text-muted-foreground/60">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-[14px] font-medium tracking-[-0.01em]">
                          {booking.guest_name}
                        </p>
                        <p className="mt-0.5 truncate text-[12px] text-muted-foreground">
                          {(booking.hotels as unknown as { name: string } | null)?.name ??
                            "—"}{" "}
                          · {booking.check_in} → {booking.check_out}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <BookingStatusBadge status={booking.status} />
                      <ArrowUpLeft className="size-4 text-muted-foreground opacity-0 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:opacity-100" />
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
