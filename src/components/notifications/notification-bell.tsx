"use client";

import Link from "next/link";
import { formatDistanceToNowStrict } from "date-fns";
import { ar } from "date-fns/locale";
import { Bell, MessageSquareText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useBookingNotifications } from "@/hooks/use-booking-notifications";

export function NotificationBell({ currentUserId }: { currentUserId: string }) {
  const { threads, unreadCount, isLoading, markThreadRead } =
    useBookingNotifications(currentUserId);

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button variant="ghost" size="icon" aria-label="الإشعارات" className="relative" />
        }
      >
        <Bell className="size-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -end-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-xs leading-none font-semibold tabular-nums text-destructive-foreground ring-2 ring-background">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[340px] overflow-hidden p-0">
        <div className="border-b border-[var(--hairline)] px-4 py-3.5">
          <h2 className="text-sm font-semibold">الإشعارات</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            رسائل ومستجدات الحجوزات التي تتابعها
          </p>
        </div>
        <ScrollArea className="max-h-80">
          {!isLoading && threads.length === 0 && (
            <p className="px-4 py-8 text-sm text-muted-foreground">
              لا توجد إشعارات جديدة
            </p>
          )}
          <div className="flex flex-col">
            {threads.map((thread) => (
              <Link
                key={thread.booking_id}
                href={`/bookings/${thread.booking_id}`}
                onClick={() => markThreadRead(thread.booking_id)}
                className="row-interactive flex items-start gap-3 border-b border-[var(--hairline)] px-4 py-3.5 text-start last:border-0"
              >
                <MessageSquareText className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium tracking-[-0.01em]">
                      {thread.guest_name}
                    </p>
                    <Badge variant="secondary" className="shrink-0 tabular-nums">
                      {thread.unread_count}
                    </Badge>
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {thread.hotel_name}
                  </p>
                  <p className="mt-1 truncate text-xs text-foreground/75">
                    {thread.last_message}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatDistanceToNowStrict(new Date(thread.last_message_at), {
                      addSuffix: true,
                      locale: ar,
                    })}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
