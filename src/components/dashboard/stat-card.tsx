import type { LucideIcon } from "lucide-react";
import { CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const ACCENT_CLASSES = {
  primary: {
    tile: "bg-gradient-to-br from-primary/15 to-primary/5 border-primary/20",
    chip: "bg-primary/15 text-primary",
  },
  amber: {
    tile: "bg-gradient-to-br from-chart-4/15 to-chart-4/5 border-chart-4/20",
    chip: "bg-chart-4/15 text-chart-4",
  },
  green: {
    tile: "bg-gradient-to-br from-chart-3/15 to-chart-3/5 border-chart-3/20",
    chip: "bg-chart-3/15 text-chart-3",
  },
  red: {
    tile: "bg-gradient-to-br from-destructive/15 to-destructive/5 border-destructive/20",
    chip: "bg-destructive/15 text-destructive",
  },
} as const;

export function StatCard({
  label,
  value,
  icon: Icon,
  accent,
  index = 0,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: "primary" | "amber" | "green" | "red";
  index?: number;
}) {
  const { tile, chip } = ACCENT_CLASSES[accent ?? "primary"];

  return (
    <div
      className={cn("stat-tile group animate-slide-in-up cursor-default p-5", tile)}
      style={{ animationDelay: `${index * 80}ms`, animationFillMode: "backwards" }}
    >
      <div className="stat-tile-blob" />
      <CardContent className="relative z-10 flex flex-col gap-4 p-0">
        <div className={cn("flex size-11 items-center justify-center rounded-xl", chip)}>
          <Icon className="size-5" />
        </div>
        <div>
          <p className="text-3xl font-bold leading-tight tracking-tight">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </div>
  );
}
