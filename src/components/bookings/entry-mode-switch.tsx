import Link from "next/link";
import { cn } from "@/lib/utils";

const MODES = [
  { key: "detailed", label: "حجز كامل", href: "/bookings/new" },
  { key: "quick", label: "حجز سريع (لصق نص)", href: "/bookings/quick" },
] as const;

export function EntryModeSwitch({ active }: { active: (typeof MODES)[number]["key"] }) {
  return (
    <nav
      aria-label="طريقة إضافة الحجز"
      className="flex w-fit items-center gap-1 rounded-lg border border-[var(--hairline)] bg-muted/40 p-1"
    >
      {MODES.map((mode) => (
        <Link
          key={mode.key}
          href={mode.href}
          aria-current={mode.key === active ? "page" : undefined}
          className={cn(
            "rounded-md border px-3 py-2 text-sm font-medium transition-colors duration-150 ease-out",
            mode.key === active
              ? "border-[var(--hairline)] bg-card text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground",
          )}
        >
          {mode.label}
        </Link>
      ))}
    </nav>
  );
}
