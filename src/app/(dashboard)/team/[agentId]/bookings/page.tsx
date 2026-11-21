import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowRight, CalendarCheck } from "lucide-react";
import { BookingsTable, type BookingRow } from "@/components/bookings/bookings-table";
import { PageHeader } from "@/components/layout/page-header";
import { getCurrentUser } from "@/lib/auth/get-current-profile";
import { createClient } from "@/lib/supabase/server";

// PostgREST caps one response at 1000 rows on Supabase, so a member's
// bookings are read in pages to make sure none are left out.
const PAGE_SIZE = 1000;

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

async function fetchMemberBookings(supabase: SupabaseServerClient, agentId: string) {
  const rows: BookingRow[] = [];

  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from("bookings")
      .select("id, guest_name, check_in, check_out, status, total_cost, entry_type, hotels(name)")
      .eq("created_by", agentId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .order("id", { ascending: true })
      .range(from, from + PAGE_SIZE - 1);

    if (error) return { rows, error };

    for (const b of data ?? []) {
      rows.push({
        id: b.id,
        guest_name: b.guest_name,
        check_in: b.check_in,
        check_out: b.check_out,
        status: b.status,
        total_cost: b.total_cost,
        entry_type: b.entry_type,
        hotel_name: (b.hotels as unknown as { name: string } | null)?.name ?? null,
      });
    }

    if (!data || data.length < PAGE_SIZE) return { rows, error: null };
  }
}

export default async function MemberAllBookingsPage({
  params,
}: {
  params: Promise<{ agentId: string }>;
}) {
  const { agentId } = await params;

  const user = await getCurrentUser();
  if (user?.profile?.role !== "admin") {
    redirect("/");
  }

  const supabase = await createClient();
  const [{ data: agent }, { rows, error }] = await Promise.all([
    supabase.from("profiles").select("id, full_name").eq("id", agentId).single(),
    fetchMemberBookings(supabase, agentId),
  ]);

  if (!agent) notFound();

  const name = agent.full_name || "بدون اسم";
  const pendingCount = rows.filter((b) => b.status === "pending").length;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <Link
          href="/"
          className="eyebrow inline-flex w-fit items-center gap-1 transition-colors duration-150 ease-out hover:text-foreground"
        >
          <ArrowRight className="size-3" aria-hidden />
          لوحة التحكم
        </Link>
        <PageHeader
          title={name}
          description={
            <>
              <span className="tabular-nums">{rows.length.toLocaleString()}</span> حجز إجمالاً،
              منها{" "}
              <span className="font-medium tabular-nums text-chart-3">
                {pendingCount.toLocaleString()}
              </span>{" "}
              جديد قيد المراجعة.
            </>
          }
          actions={
            <Link
              href={`/team/${agentId}`}
              className="text-sm text-muted-foreground underline underline-offset-4 transition-colors duration-150 ease-out hover:text-foreground"
            >
              عرض الحجوزات حسب الفندق
            </Link>
          }
        />
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          تعذر تحميل الحجوزات. {error.message}
        </p>
      )}

      {rows.length === 0 && !error && (
        <div className="glass-panel flex flex-col items-center gap-3 px-6 py-20 text-center">
          <CalendarCheck className="size-6 text-muted-foreground" aria-hidden />
          <p className="text-sm text-muted-foreground">لم يضف {name} أي حجوزات بعد.</p>
        </div>
      )}

      {rows.length > 0 && <BookingsTable bookings={rows} />}
    </div>
  );
}
