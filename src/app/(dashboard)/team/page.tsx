import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpLeft, ShieldCheck, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import { getCurrentUser } from "@/lib/auth/get-current-profile";
import { createClient } from "@/lib/supabase/server";

export default async function TeamPage() {
  const user = await getCurrentUser();
  if (user?.profile?.role !== "admin") {
    redirect("/");
  }

  const supabase = await createClient();
  const { data: agents, error } = await supabase.rpc("get_agent_booking_counts");

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="أداء الفريق"
        title="الفريق"
        description="عدد الحجوزات المسجلة لكل عضو — اضغط على أي عضو لعرض الفنادق التي حجز بها"
      />

      {error && (
        <p className="rounded-xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-[13px] text-destructive">
          تعذر تحميل بيانات الفريق: {error.message}
        </p>
      )}

      {agents && agents.length === 0 && !error && (
        <div className="glass-panel flex flex-col items-center gap-3 px-6 py-20 text-center">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-muted/60">
            <Users className="size-5 text-muted-foreground" />
          </div>
          <p className="text-[13.5px] text-muted-foreground">لا يوجد أعضاء فريق بعد.</p>
        </div>
      )}

      {agents && agents.length > 0 && (
        <div className="glass-panel overflow-hidden">
          <div className="hidden grid-cols-[1.6fr_0.6fr_auto] gap-4 border-b border-[var(--hairline)] px-6 py-3.5 lg:grid">
            <span className="eyebrow">العضو</span>
            <span className="eyebrow">الصلاحية</span>
            <span className="eyebrow text-end">عدد الحجوزات</span>
          </div>

          <ul>
            {agents.map((agent, i) => (
              <li key={agent.agent_id}>
                <Link
                  href={`/team/${agent.agent_id}`}
                  className="row-interactive animate-fade-in-up group grid grid-cols-1 gap-x-4 gap-y-2 border-b border-[var(--hairline)] px-6 py-4 last:border-0 lg:grid-cols-[1.6fr_0.6fr_auto] lg:items-center"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="truncate text-[14px] font-medium tracking-[-0.01em]">
                      {agent.full_name || "—"}
                    </span>
                    <ArrowUpLeft className="size-3.5 shrink-0 text-muted-foreground opacity-0 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:opacity-100" />
                  </div>

                  <span>
                    <Badge
                      variant="outline"
                      className={
                        agent.role === "admin"
                          ? "border-chart-2/25 bg-chart-2/10 text-chart-2"
                          : "text-muted-foreground"
                      }
                    >
                      {agent.role === "admin" && <ShieldCheck />}
                      {agent.role === "admin" ? "مسؤول" : "عضو فريق"}
                    </Badge>
                  </span>

                  <span className="justify-self-start text-[15px] font-semibold tabular-nums lg:justify-self-end">
                    {agent.booking_count.toLocaleString()}
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
