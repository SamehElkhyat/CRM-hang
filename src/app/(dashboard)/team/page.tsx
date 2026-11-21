import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Info, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TeamMemberCard,
  type TeamMember,
  type TeamMemberBooking,
} from "@/components/team/team-member-card";
import { getCurrentUser } from "@/lib/auth/get-current-profile";
import { createClient } from "@/lib/supabase/server";
import type { BookingStatus } from "@/types/database.types";

// A booking is "new" while it is still awaiting review (قيد المراجعة).
const NEW_BOOKING_STATUS: BookingStatus = "pending";

// PostgREST caps a single response (1000 rows by default on Supabase), so
// bookings are read in fixed-size pages to keep per-member counts exact.
const PAGE_SIZE = 1000;

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

async function fetchActiveBookings(supabase: SupabaseServerClient) {
  const rows: (TeamMemberBooking & { created_by: string })[] = [];

  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from("bookings")
      .select("id, created_by, guest_name, check_in, check_out, status, entry_type, hotels(name)")
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .order("id", { ascending: true })
      .range(from, from + PAGE_SIZE - 1);

    if (error) return { rows, error };

    for (const b of data ?? []) {
      // Bookings without an author can't be attributed to any team member.
      if (!b.created_by) continue;
      rows.push({
        id: b.id,
        created_by: b.created_by,
        guest_name: b.guest_name,
        check_in: b.check_in,
        check_out: b.check_out,
        status: b.status,
        entry_type: b.entry_type,
        hotel_name: (b.hotels as unknown as { name: string } | null)?.name ?? null,
      });
    }

    if (!data || data.length < PAGE_SIZE) return { rows, error: null };
  }
}

export default async function TeamPage() {
  const user = await getCurrentUser();
  if (user?.profile?.role !== "admin") {
    redirect("/");
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="أداء الفريق"
        title="الفريق"
        description="متابعة أعضاء الفريق وحجوزاتهم — اضغط على أي حجز لفتح تفاصيله"
      />

      <Suspense fallback={<TeamGridSkeleton />}>
        <TeamGrid />
      </Suspense>
    </div>
  );
}

const GRID_CLASS = "grid grid-cols-1 gap-4 sm:grid-cols-2 min-[1360px]:grid-cols-4";

function TeamGridSkeleton() {
  return (
    <div className={GRID_CLASS} aria-busy="true" aria-label="جارٍ تحميل الفريق">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="glass-panel flex h-[460px] flex-col overflow-hidden">
          <div className="flex items-center gap-3 border-b border-[var(--hairline)] px-4 py-4">
            <Skeleton className="size-11 rounded-full" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
            </div>
            <Skeleton className="h-6 w-14 rounded-full" />
          </div>
          <div className="flex flex-col gap-4 px-4 py-4">
            {Array.from({ length: 4 }).map((__, j) => (
              <div key={j} className="flex items-center gap-3">
                <div className="flex flex-1 flex-col gap-1.5">
                  <Skeleton className="h-3.5 w-1/2" />
                  <Skeleton className="h-3 w-2/5" />
                  <Skeleton className="h-3 w-3/5" />
                </div>
                <Skeleton className="h-[22px] w-16 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

async function TeamGrid() {
  const supabase = await createClient();
  const [{ data: agents, error: agentsError }, { rows: bookings, error: bookingsError }] =
    await Promise.all([supabase.rpc("get_agent_booking_counts"), fetchActiveBookings(supabase)]);

  const error = agentsError ?? bookingsError;

  const bookingsByMember = new Map<string, TeamMemberBooking[]>();
  for (const { created_by, ...booking } of bookings) {
    const list = bookingsByMember.get(created_by);
    if (list) list.push(booking);
    else bookingsByMember.set(created_by, [booking]);
  }

  const members: TeamMember[] = (agents ?? []).map((agent) => {
    const memberBookings = bookingsByMember.get(agent.agent_id) ?? [];
    return {
      id: agent.agent_id,
      full_name: agent.full_name,
      role: agent.role,
      total_bookings: Number(agent.booking_count),
      new_bookings: memberBookings.filter((b) => b.status === NEW_BOOKING_STATUS).length,
      bookings: memberBookings,
    };
  });

  const totalNew = members.reduce((sum, m) => sum + m.new_bookings, 0);

  return (
    <>
      {error && (
        <p className="rounded-xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-[13px] text-destructive">
          تعذر تحميل بيانات الفريق: {error.message}
        </p>
      )}

      {members.length === 0 && !error && (
        <div className="glass-panel flex flex-col items-center gap-3 px-6 py-20 text-center">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-muted/60">
            <Users className="size-5 text-muted-foreground" />
          </div>
          <p className="text-[13.5px] text-muted-foreground">لا يوجد أعضاء فريق بعد.</p>
        </div>
      )}

      {members.length > 0 && (
        <>
          <section className={GRID_CLASS}>
            {members.map((member, i) => (
              <TeamMemberCard key={member.id} member={member} index={i} />
            ))}
          </section>

          <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--hairline)] pt-4 text-[12.5px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Info className="size-3.5" />
              اضغط على أي حجز لعرض تفاصيله
            </span>
            <span className="flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1.5 font-medium text-chart-3">
                <span className="size-1.5 rounded-full bg-chart-3" aria-hidden />
                <span className="tabular-nums">{totalNew.toLocaleString()}</span> حجز جديد
                قيد المراجعة
              </span>
              <span>
                عرض <span className="tabular-nums">{members.length.toLocaleString()}</span> من
                أعضاء الفريق
              </span>
            </span>
          </footer>
        </>
      )}
    </>
  );
}
