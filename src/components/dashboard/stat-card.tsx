import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const ACCENT = {
  primary: { blob: "bg-chart-1", chip: "bg-chart-1/12 text-chart-1", rule: "bg-chart-1/40" },
  amber: { blob: "bg-chart-4", chip: "bg-chart-4/12 text-chart-4", rule: "bg-chart-4/40" },
  green: { blob: "bg-chart-3", chip: "bg-chart-3/12 text-chart-3", rule: "bg-chart-3/40" },
  red: {
    blob: "bg-destructive",
    chip: "bg-destructive/12 text-destructive",
    rule: "bg-destructive/40",
  },
} as const;

export function StatCard({
  label,
  value,
  icon: Icon,
  accent,
  index = 0,
  featured = false,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: keyof typeof ACCENT;
  index?: number;
  featured?: boolean;
}) {
  const tone = ACCENT[accent ?? "primary"];

  return (
    <div
      className={cn(
        "stat-tile animate-fade-in-up group flex flex-col justify-between",
        featured ? "gap-8 p-6" : "gap-6 p-5",
      )}
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <div className={cn("stat-tile-blob", tone.blob)} aria-hidden />

      <div className="relative z-10 flex items-start justify-between gap-3">
        <div
          className={cn(
            "flex items-center justify-center rounded-xl transition-transform duration-500 group-hover:scale-105",
            tone.chip,
            featured ? "size-12" : "size-10",
          )}
        >
          <Icon className={featured ? "size-[22px]" : "size-[18px]"} />
        </div>
        <div className={cn("mt-2 h-px flex-1 origin-right", tone.rule)} aria-hidden />
      </div>

      <div className="relative z-10">
        <p
          className={cn(
            "font-semibold tabular-nums tracking-[-0.03em]",
            featured ? "text-[2.75rem] leading-[1.05]" : "text-[2rem] leading-[1.1]",
          )}
        >
          {value}
        </p>
        <p className="mt-1.5 text-[13px] text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
