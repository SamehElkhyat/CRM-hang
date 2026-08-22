"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { navPillSpring } from "@/lib/motion";
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
    <nav className="flex flex-col gap-0.5 px-3 py-5">
      <p className="eyebrow px-3 pb-3">التنقل</p>

      {visibleItems.map((item) => {
        const isActive =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "group/nav relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] font-medium transition-colors duration-300",
              isActive
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {isActive && (
              <motion.span
                layoutId="active-nav-pill"
                transition={navPillSpring}
                className="absolute inset-0 rounded-lg border border-[var(--hairline)] bg-accent/70"
              />
            )}
            {/* leading accent bar — reads as a deliberate marker, not a filled chip */}
            {isActive && (
              <motion.span
                layoutId="active-nav-bar"
                transition={navPillSpring}
                className="absolute inset-y-1.5 start-0 w-[2px] rounded-full bg-foreground"
              />
            )}
            {!isActive && (
              <span className="absolute inset-0 rounded-lg opacity-0 transition-opacity duration-300 group-hover/nav:bg-accent/40 group-hover/nav:opacity-100" />
            )}

            <Icon
              className={cn(
                "relative z-10 size-[17px] shrink-0 transition-transform duration-300 group-hover/nav:scale-105",
                isActive ? "opacity-100" : "opacity-70",
              )}
            />
            <span className="relative z-10">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
