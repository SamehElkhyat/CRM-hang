import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TeamMemberCard,
  type TeamMember,
  type TeamMemberBooking,
} from "@/components/team/team-member-card";
import { createClient } from "@/lib/supabase/server";
import type { BookingStatus } from "@/types/database.types";

// A booking counts as "new" while it is still awaiting review (قيد المراجعة).
const NEW_BOOKING_STATUS: BookingStatus = "pending";

// PostgREST caps one response at 1000 rows on Supabase, so bookings are read
// in pages to keep every member's counts exact.
const PAGE_SIZE = 1000;

const GRID_CLASS = "grid grid-cols-1 gap-4 sm:grid-cols-2 min-[1360px]:grid-cols-4";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;
type AttributedBooking = TeamMemberBooking & { created_by: string };

async function fetchActiveBookings(supabase: SupabaseServerClient) {
  const rows: AttributedBooking[] = [];

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
      // A booking without an author cannot be attributed to a team member.
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

async function TeamBoardContent() {
  const supabase = await createClient();
  const [{ data: agents, error: agentsError }, { rows: bookings, error: bookingsError }] =
    await Promise.all([supabase.rpc("get_agent_booking_counts"), fetchActiveBookings(supabase)]);

  const error = agentsError ?? bookingsError;
  if (error) {
    return (
      <p
        role="alert"
        className="rounded-xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive"
      >
        تعذر تحميل بيانات الفريق. {error.message}
      </p>
    );
  }

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

  if (members.length === 0) {
    return (
      <p className="rounded-xl border border-[var(--hairline)] bg-card px-4 py-8 text-sm text-muted-foreground">
        لا يوجد أعضاء في الفريق بعد. عند إضافة أعضاء ستظهر حجوزاتهم هنا.
      </p>
    );
  }

  const totalNew = members.reduce((sum, m) => sum + m.new_bookings, 0);

  return (
    <>
      <p className="text-sm text-muted-foreground">
        <span className="font-medium tabular-nums text-chart-3">{totalNew.toLocaleString()}</span>{" "}
        حجز جديد قيد المراجعة لدى{" "}
        <span className="tabular-nums">{members.length.toLocaleString()}</span> أعضاء
      </p>
      <div className={GRID_CLASS}>
        {members.map((member) => (
          <TeamMemberCard key={member.id} member={member} />
        ))}
      </div>
    </>
  );
}

function TeamBoardSkeleton() {
  const bar = "motion-reduce:animate-none";
  return (
    <div className={GRID_CLASS} aria-busy="true">
      <span className="sr-only">جارٍ تحميل بيانات الفريق</span>
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col overflow-hidden rounded-xl border border-[var(--hairline)] bg-card"
        >
          <div className="flex items-center gap-3 border-b border-[var(--hairline)] p-4">
            <Skeleton className={`size-10 rounded-full ${bar}`} />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className={`h-4 w-2/3 ${bar}`} />
              <Skeleton className={`h-3 w-1/3 ${bar}`} />
            </div>
            <Skeleton className={`h-6 w-12 rounded-full ${bar}`} />
          </div>
          {Array.from({ length: 3 }).map((__, j) => (
            <div key={j} className="flex flex-col gap-2 border-b border-[var(--hairline)] px-4 py-3 last:border-0">
              <Skeleton className={`h-4 w-1/2 ${bar}`} />
              <Skeleton className={`h-3 w-2/5 ${bar}`} />
              <Skeleton className={`h-3 w-3/5 ${bar}`} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export function TeamBoard() {
  return (
    <section aria-labelledby="team-board-title" className="flex flex-col gap-4">
      <div>
        <h2 id="team-board-title" className="text-lg font-semibold tracking-[-0.02em]">
          الفريق
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          حجوزات كل عضو في الفريق. اضغط على أي حجز لفتح تفاصيله.
        </p>
      </div>
      <Suspense fallback={<TeamBoardSkeleton />}>
        <TeamBoardContent />
      </Suspense>
    </section>
  );
}
