import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CalendarCheck, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { BookingsTable, type BookingRow } from "@/components/bookings/bookings-table";

export default async function AgentBookingsLast24hPage({
  params,
}: {
  params: Promise<{ agentId: string }>;
}) {
  const { agentId } = await params;

  const supabase = await createClient();
  const sinceDate = new Date();
  sinceDate.setDate(sinceDate.getDate() - 1);
  const since = sinceDate.toISOString();

  const [{ data: agent }, { data: bookings, error }] = await Promise.all([
    supabase.from("profiles").select("id, full_name, role").eq("id", agentId).single(),
    supabase
      .from("bookings")
      .select("id, guest_name, check_in, check_out, status, total_cost, entry_type, hotels(name)")
      .eq("created_by", agentId)
      .is("deleted_at", null)
      .gte("created_at", since)
      .order("created_at", { ascending: false }),
  ]);

  if (!agent) notFound();

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

  return (
    <div className="flex flex-col gap-8">
      <header className="animate-fade-in-up flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div className="min-w-0">
          <div className="eyebrow flex flex-wrap items-center gap-1.5">
            <Link href="/team-bookings" className="transition-colors hover:text-foreground">
              حجوزات الفريق
            </Link>
            <ArrowRight className="size-3 rotate-180" />
            <span>{agent.full_name || "—"}</span>
          </div>
          <h1 className="mt-2 truncate text-[1.75rem] font-semibold tracking-[-0.03em] lg:text-[2.125rem]">
            {agent.full_name || "—"}
          </h1>
          <p className="mt-1.5 flex items-center gap-1.5 text-[13.5px] text-muted-foreground">
            <Clock className="size-3.5" />
            <span className="tabular-nums">{rows.length}</span> حجز خلال آخر 24 ساعة
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
          <p className="text-[13.5px] text-muted-foreground">
            لم يقم {agent.full_name || "هذا العضو"} بإضافة أي حجوزات خلال آخر 24 ساعة.
          </p>
        </div>
      )}

      {rows.length > 0 && <BookingsTable bookings={rows} />}
    </div>
  );
}
