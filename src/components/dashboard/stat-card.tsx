import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: "primary" | "amber" | "green" | "red";
}) {
  const accentClass =
    {
      primary: "bg-primary/10 text-primary",
      amber: "bg-chart-4/15 text-chart-4",
      green: "bg-chart-3/15 text-chart-3",
      red: "bg-destructive/10 text-destructive",
    }[accent ?? "primary"];

  return (
    <Card className="glass-panel">
      <CardContent className="flex items-center gap-4 px-5 py-4">
        <div className={cn("flex size-11 items-center justify-center rounded-xl", accentClass)}>
          <Icon className="size-5" />
        </div>
        <div>
          <p className="text-2xl font-bold leading-tight">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
