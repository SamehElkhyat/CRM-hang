"use client";

import * as React from "react";
import { CalendarCheck, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SidebarNav } from "./sidebar-nav";
import { ThemeToggle } from "./theme-toggle";
import type { CurrentUser } from "@/lib/auth/get-current-profile";
import { UserMenu } from "./user-menu";

export function Topbar({ user }: { user: CurrentUser }) {
  const [open, setOpen] = React.useState(false);

  return (
    <header className="glass-panel sticky top-0 z-30 flex items-center justify-between gap-3 px-4 py-3 lg:px-6">
      <div className="flex items-center gap-2 lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={<Button variant="ghost" size="icon" aria-label="فتح القائمة" />}
          >
            <Menu className="size-5" />
          </SheetTrigger>
          <SheetContent side="right" className="w-64 p-0">
            <SheetHeader className="flex-row items-center gap-2 space-y-0 px-5 py-5">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <CalendarCheck className="size-4" />
              </div>
              <SheetTitle className="text-sm">الحجوزات والعمليات</SheetTitle>
            </SheetHeader>
            <SidebarNav onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>
      <div className="flex-1" />
      <div className="flex items-center gap-1">
        <ThemeToggle />
        <UserMenu user={user} />
      </div>
    </header>
  );
}
