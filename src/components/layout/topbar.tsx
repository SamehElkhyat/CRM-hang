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
import { NotificationBell } from "@/components/notifications/notification-bell";

export function Topbar({ user }: { user: CurrentUser }) {
  const [open, setOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--hairline)] bg-background/70 backdrop-blur-2xl">
      <div className="flex h-16 items-center justify-between gap-3 px-4 lg:px-8">
        <div className="flex items-center gap-2 lg:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={<Button variant="ghost" size="icon" aria-label="فتح القائمة" />}
            >
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-[264px] border-0 bg-sidebar p-0">
              <SheetHeader className="flex-row items-center gap-3 space-y-0 px-6 py-6">
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <CalendarCheck className="size-[18px]" />
                </div>
                <SheetTitle className="text-[15px] tracking-tight">
                  الحجوزات والعمليات
                </SheetTitle>
              </SheetHeader>
              <div className="px-6">
                <div className="h-px w-full bg-[var(--hairline)]" />
              </div>
              <SidebarNav
                onNavigate={() => setOpen(false)}
                isAdmin={user.profile?.role === "admin"}
              />
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-1">
          <NotificationBell currentUserId={user.id} />
          <ThemeToggle />
          <div className="mx-1 h-6 w-px bg-[var(--hairline)]" />
          <UserMenu user={user} />
        </div>
      </div>
    </header>
  );
}
