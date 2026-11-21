import type { LucideIcon } from "lucide-react";

// A metric tile. Flat on purpose: a hairline border separates it from the
// page, the number carries the weight, and the icon sits beside the label
// at text size in the label's own colour.
export function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
}) {
  return (
    <div className="glass-panel flex h-full flex-col justify-between gap-6 p-5">
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="size-4 shrink-0" aria-hidden />
        {label}
      </p>
      <p className="text-display font-semibold tabular-nums tracking-[-0.03em]">{value}</p>
    </div>
  );
}
