"use client";

import { motion } from "framer-motion";
import { CalendarCheck } from "lucide-react";
import { SidebarNav } from "./sidebar-nav";
import { EASE_OUT_EXPO } from "@/lib/motion";

export function AppSidebar({ isAdmin = false }: { isAdmin?: boolean }) {
  return (
    <motion.aside
      initial={{ x: -28, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
      className="relative hidden w-[264px] shrink-0 flex-col bg-sidebar/70 backdrop-blur-2xl lg:flex"
    >
      {/* hairline edge instead of a heavy border */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 -end-px w-px bg-gradient-to-b from-transparent via-[var(--hairline-strong)] to-transparent"
      />

      <div className="flex items-center gap-3 px-6 py-6">
        <div className="relative">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-[0_8px_22px_-10px_rgb(0_0_0_/_0.7)]">
            <CalendarCheck className="size-[18px]" />
          </div>
          <span className="absolute -end-0.5 -top-0.5 size-2.5 rounded-full bg-chart-3 ring-2 ring-sidebar" />
        </div>
        <div className="leading-tight">
          <p className="text-[15px] font-semibold tracking-tight">الحجوزات والعمليات</p>
          <p className="mt-0.5 text-[11px] tracking-wide text-muted-foreground">
            Reservation Ops
          </p>
        </div>
      </div>

      <div className="px-6">
        <div className="h-px w-full bg-[var(--hairline)]" />
      </div>

      <SidebarNav isAdmin={isAdmin} />
    </motion.aside>
  );
}
