import { cn } from "@/lib/utils";

/**
 * Shared page masthead: title, one line saying what the page is for, and
 * the page's actions. Presentation only, so every screen keeps the same
 * rhythm.
 */
export function PageHeader({
  title,
  description,
  actions,
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn("flex flex-wrap items-end justify-between gap-x-6 gap-y-4", className)}
    >
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-[-0.03em] lg:text-display">{title}</h1>
        {description && (
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}
