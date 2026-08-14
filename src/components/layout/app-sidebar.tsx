import { CalendarCheck } from "lucide-react";
import { SidebarNav } from "./sidebar-nav";

export function AppSidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-e border-sidebar-border bg-sidebar lg:flex lg:flex-col">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <CalendarCheck className="size-4" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-bold">الحجوزات والعمليات</p>
          <p className="text-xs text-muted-foreground">Reservation Ops</p>
        </div>
      </div>
      <SidebarNav />
    </aside>
  );
}
