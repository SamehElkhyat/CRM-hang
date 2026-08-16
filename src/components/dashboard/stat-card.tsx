import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// Restrained on purpose: the only two colors that appear anywhere in this
// set are the brand's own wine-red (--primary) and navy (--chart-2) — used
// once each, on the two metrics worth calling out. Everything else stays
// neutral so the accents actually read as intentional, not decorative noise.
const ACCENT = {
  brand: {
    blob: "bg-primary",
    chip: "bg-primary/10 text-primary",
    rule: "bg-primary/35",
  },
  navy: {
    blob: "bg-chart-2",
    chip: "bg-chart-2/10 text-chart-2",
    rule: "bg-chart-2/35",
  },
  neutral: {
    blob: "bg-foreground/50",
    chip: "bg-foreground/8 text-foreground",
    rule: "bg-foreground/15",
  },
} as const;

export function StatCard({
  label,
  value,
  icon: Icon,
  accent = "neutral",
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
  const tone = ACCENT[accent];

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
