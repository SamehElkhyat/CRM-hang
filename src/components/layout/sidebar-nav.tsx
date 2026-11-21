"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "./nav-items";

export function SidebarNav({
  onNavigate,
  isAdmin = false,
}: {
  onNavigate?: () => void;
  isAdmin?: boolean;
}) {
  const pathname = usePathname();
  const visibleItems = NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin);

  return (
    <nav aria-label="التنقل الرئيسي" className="flex flex-col gap-1 px-3 py-5">
      {visibleItems.map((item) => {
        const isActive =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150 ease-out focus-visible:outline-2 focus-visible:outline-ring",
              isActive
                ? "bg-accent text-foreground before:absolute before:inset-y-2 before:start-0 before:w-0.5 before:rounded-full before:bg-foreground"
                : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
