import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowRight, CalendarCheck } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/get-current-profile";
import { createClient } from "@/lib/supabase/server";
import { BookingsTable, type BookingRow } from "@/components/bookings/bookings-table";

export default async function AgentHotelBookingsPage({
  params,
}: {
  params: Promise<{ agentId: string; hotelId: string }>;
}) {
  const { agentId, hotelId } = await params;

  const user = await getCurrentUser();
  if (user?.profile?.role !== "admin") {
    redirect("/");
  }

  const supabase = await createClient();

  const [{ data: agent }, { data: hotel }, { data: bookings, error }] = await Promise.all([
    supabase.from("profiles").select("id, full_name").eq("id", agentId).single(),
    supabase.from("hotels").select("id, name").eq("id", hotelId).single(),
    supabase
      .from("bookings")
      .select("id, guest_name, check_in, check_out, status, total_cost, entry_type")
      .eq("created_by", agentId)
      .eq("hotel_id", hotelId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false }),
  ]);

  if (!agent || !hotel) notFound();

  const rows: BookingRow[] = (bookings ?? []).map((b) => ({
    id: b.id,
    guest_name: b.guest_name,
    check_in: b.check_in,
    check_out: b.check_out,
    status: b.status,
    total_cost: b.total_cost,
    entry_type: b.entry_type,
    hotel_name: hotel.name,
  }));

  return (
    <div className="flex flex-col gap-8">
      <header className="animate-fade-in-up flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div className="min-w-0">
          <div className="eyebrow flex flex-wrap items-center gap-1.5">
            <Link href="/team" className="transition-colors hover:text-foreground">
              الفريق
            </Link>
            <ArrowRight className="size-3 rotate-180" />
            <Link
              href={`/team/${agentId}`}
              className="transition-colors hover:text-foreground"
            >
              {agent.full_name || "—"}
            </Link>
          </div>
          <h1 className="mt-2 truncate text-[1.75rem] font-semibold tracking-[-0.03em] lg:text-[2.125rem]">
            {hotel.name}
          </h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">
            <span className="tabular-nums">{rows.length}</span> حجز بواسطة{" "}
            {agent.full_name || "—"} في هذا الفندق
          </p>
        </div>
      </header>

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
          <p className="text-[13.5px] text-muted-foreground">لا توجد حجوزات هنا.</p>
        </div>
      )}

      {rows.length > 0 && <BookingsTable bookings={rows} />}
    </div>
  );
}
