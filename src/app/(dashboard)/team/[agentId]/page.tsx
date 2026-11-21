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
      <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div className="min-w-0">
          <Link
            href="/team"
            className="eyebrow inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
          >
            <ArrowRight className="size-3" />
            الفريق
          </Link>
          <h1 className="mt-2 truncate text-2xl font-semibold tracking-[-0.03em] lg:text-display">
            {agent.full_name || "بدون اسم"}
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            <span className="tabular-nums">{totalBookings}</span> حجز إجمالاً عبر{" "}
            <span className="tabular-nums">{(hotels ?? []).length}</span> فندق. اضغط على أي
            فندق لعرض تفاصيل الحجوزات
          </p>
        </div>
      </header>

      {error && (
        <p className="rounded-xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          تعذر تحميل الفنادق: {error.message}
        </p>
      )}

      {hotels && hotels.length === 0 && !error && (
        <div className="glass-panel flex flex-col items-center gap-3 px-6 py-20 text-center">
          <Building2 className="size-6 text-muted-foreground" aria-hidden />
          <p className="text-sm text-muted-foreground">
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
            {hotels.map((hotel) => (
              <li key={hotel.hotel_id}>
                <Link
                  href={`/team/${agentId}/${hotel.hotel_id}`}
                  className="row-interactive group grid grid-cols-1 gap-x-4 gap-y-2 border-b border-[var(--hairline)] px-6 py-4 last:border-0 lg:grid-cols-[1.6fr_auto] lg:items-center"
                >
                  <div className="flex items-center gap-2.5">
                    <Building2 className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                    <span className="truncate text-sm font-medium tracking-[-0.01em]">
                      {hotel.hotel_name}
                    </span>
                    <ArrowUpLeft className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity duration-150 ease-out group-hover:opacity-100" aria-hidden />
                  </div>

                  <span className="justify-self-start text-base font-semibold tabular-nums lg:justify-self-end">
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
