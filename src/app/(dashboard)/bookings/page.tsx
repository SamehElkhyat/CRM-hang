import Link from "next/link";
import { CalendarCheck, Plus, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { BookingsTable, type BookingRow } from "@/components/bookings/bookings-table";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/get-current-profile";

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter: rawFilter } = await searchParams;
  const filter = rawFilter === "following" ? "following" : "all";

  const [supabase, currentUser] = await Promise.all([createClient(), getCurrentUser()]);

  let query = supabase
    .from("bookings")
    .select(
      "id, guest_name, check_in, check_out, status, total_cost, entry_type, hotels(name)",
    )
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(100);

  if (filter === "following" && currentUser) {
    const { data: follows } = await supabase
      .from("booking_followers")
      .select("booking_id")
      .eq("user_id", currentUser.id);
    const followedIds = (follows ?? []).map((f) => f.booking_id);

    query =
      followedIds.length > 0
        ? query.or(`created_by.eq.${currentUser.id},id.in.(${followedIds.join(",")})`)
        : query.eq("created_by", currentUser.id);
  }

  const { data: bookings, error } = await query;

  const rows: BookingRow[] = (bookings ?? []).map((b) => ({
    id: b.id,
    guest_name: b.guest_name,
    check_in: b.check_in,
    check_out: b.check_out,
    status: b.status,
    total_cost: b.total_cost,
    entry_type: b.entry_type,
    hotel_name: (b.hotels as unknown as { name: string } | null)?.name ?? null,
  }));

  const tabs = [
    { key: "all", label: "الكل", href: "/bookings" },
    { key: "following", label: "متابعاتي", href: "/bookings?filter=following" },
  ];

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="السجل"
        title="الحجوزات"
        description="جميع الحجوزات المسجلة في النظام"
        actions={
          <>
            {/* segmented control — one recessed track, active pill lifts out */}
            <div className="flex items-center gap-1 rounded-xl border border-[var(--hairline)] bg-muted/40 p-1">
              {tabs.map((tab) => {
                const isActive = filter === tab.key;
                return (
                  <Link
                    key={tab.key}
                    href={tab.href}
                    className={cn(
                      "rounded-lg px-3.5 py-1.5 text-[13px] font-medium transition-all duration-300",
                      isActive
                        ? "bg-card text-foreground shadow-[0_1px_3px_rgb(0_0_0_/_0.2)]"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {tab.label}
                  </Link>
                );
              })}
            </div>
            <Button variant="outline" render={<Link href="/bookings/quick" />}>
              <Zap />
              حجز سريع
            </Button>
            <Button className="glow-primary-hover" render={<Link href="/bookings/new" />}>
              <Plus />
              إضافة حجز
            </Button>
          </>
        }
      />

      {error && (
        <p className="rounded-xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-[13px] text-destructive">
          تعذر تحميل الحجوزات: {error.message}
        </p>
      )}

      {rows.length === 0 && !error && (
        <div className="glass-panel flex flex-col items-center gap-3 px-6 py-20 text-center">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-muted/60">
            <CalendarCheck className="size-5 text-muted-foreground" />
          </div>
          <p className="text-[13.5px] text-muted-foreground">
            {filter === "following" ? (
              "لا توجد حجوزات ضمن متابعاتك بعد."
            ) : (
              <>
                لا توجد حجوزات بعد.{" "}
                <Link
                  href="/bookings/new"
                  className="text-foreground underline underline-offset-4"
                >
                  ابدأ بإضافة حجز جديد
                </Link>
              </>
            )}
          </p>
        </div>
      )}

      {rows.length > 0 && <BookingsTable bookings={rows} />}
    </div>
  );
}
