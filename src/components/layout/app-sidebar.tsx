import { CalendarCheck } from "lucide-react";
import { SidebarNav } from "./sidebar-nav";

export function AppSidebar({ isAdmin = false }: { isAdmin?: boolean }) {
  return (
    <aside className="hidden w-[264px] shrink-0 flex-col border-e border-[var(--hairline)] bg-sidebar lg:flex">
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <CalendarCheck className="size-5" aria-hidden />
        </div>
        <div className="leading-tight">
          <p className="text-base font-semibold tracking-tight">الحجوزات والعمليات</p>
          <p className="mt-1 text-xs text-muted-foreground">Reservation Ops</p>
        </div>
      </div>

      <div className="px-6">
        <div className="h-px w-full bg-[var(--hairline)]" />
      </div>

      <SidebarNav isAdmin={isAdmin} />
    </aside>
  );
}
