import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowRight, ArrowUpLeft, Building2 } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/get-current-profile";
import { createClient } from "@/lib/supabase/server";

export default async function AgentHotelsPage({
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

  const [{ data: agent }, { data: hotels, error }] = await Promise.all([
    supabase.from("profiles").select("id, full_name, role").eq("id", agentId).single(),
    supabase.rpc("get_agent_hotel_counts", { p_agent_id: agentId }),
  ]);

  if (!agent) notFound();

  const totalBookings = (hotels ?? []).reduce((sum, h) => sum + h.booking_count, 0);

  return (
    <div className="flex flex-col gap-8">
      <header className="animate-fade-in-up flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div className="min-w-0">
          <Link
            href="/team"
            className="eyebrow inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
          >
            <ArrowRight className="size-3" />
            الفريق
          </Link>
          <h1 className="mt-2 truncate text-[1.75rem] font-semibold tracking-[-0.03em] lg:text-[2.125rem]">
            {agent.full_name || "—"}
          </h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">
            <span className="tabular-nums">{totalBookings}</span> حجز إجمالاً عبر{" "}
            <span className="tabular-nums">{(hotels ?? []).length}</span> فندق — اضغط على أي
            فندق لعرض تفاصيل الحجوزات
          </p>
        </div>
      </header>

      {error && (
        <p className="rounded-xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-[13px] text-destructive">
          تعذر تحميل الفنادق: {error.message}
        </p>
      )}

      {hotels && hotels.length === 0 && !error && (
        <div className="glass-panel flex flex-col items-center gap-3 px-6 py-20 text-center">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-muted/60">
            <Building2 className="size-5 text-muted-foreground" />
          </div>
          <p className="text-[13.5px] text-muted-foreground">
            لم يقم هذا العضو بإضافة أي حجوزات بعد.
          </p>
        </div>
      )}

      {hotels && hotels.length > 0 && (
        <div className="glass-panel overflow-hidden">
          <div className="hidden grid-cols-[1.6fr_auto] gap-4 border-b border-[var(--hairline)] px-6 py-3.5 lg:grid">
            <span className="eyebrow">الفندق</span>
            <span className="eyebrow text-end">عدد الحجوزات</span>
          </div>

          <ul>
            {hotels.map((hotel, i) => (
              <li key={hotel.hotel_id}>
                <Link
                  href={`/team/${agentId}/${hotel.hotel_id}`}
                  className="row-interactive animate-fade-in-up group grid grid-cols-1 gap-x-4 gap-y-2 border-b border-[var(--hairline)] px-6 py-4 last:border-0 lg:grid-cols-[1.6fr_auto] lg:items-center"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-chart-2/10">
                      <Building2 className="size-3.5 text-chart-2" />
                    </div>
                    <span className="truncate text-[14px] font-medium tracking-[-0.01em]">
                      {hotel.hotel_name}
                    </span>
                    <ArrowUpLeft className="size-3.5 shrink-0 text-muted-foreground opacity-0 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:opacity-100" />
                  </div>

                  <span className="justify-self-start text-[15px] font-semibold tabular-nums lg:justify-self-end">
                    {hotel.booking_count.toLocaleString()}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
