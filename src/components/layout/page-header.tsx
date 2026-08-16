import { cn } from "@/lib/utils";

/**
 * Shared page masthead. Presentation only — keeps the eyebrow / display
 * title / lede rhythm identical on every screen so the app reads as one
 * designed system rather than a set of pages.
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "animate-fade-in-up flex flex-wrap items-end justify-between gap-x-6 gap-y-4",
        className,
      )}
    >
      <div className="min-w-0">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="mt-2 text-[1.75rem] font-semibold tracking-[-0.03em] lg:text-[2.125rem]">
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 max-w-xl text-[13.5px] leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}
