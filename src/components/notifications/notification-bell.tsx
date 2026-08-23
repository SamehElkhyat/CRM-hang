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
          <>
            <span className="absolute -top-0.5 -end-0.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-semibold tabular-nums text-destructive-foreground ring-2 ring-background">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
            <span className="absolute -top-0.5 -end-0.5 size-4 animate-ping rounded-full bg-destructive/40" />
          </>
        )}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[340px] overflow-hidden p-0">
        <div className="border-b border-[var(--hairline)] px-4 py-3.5">
          <p className="eyebrow">الإشعارات</p>
          <p className="mt-1 text-[12px] text-muted-foreground">
            رسائل ومستجدات الحجوزات التي تتابعها
          </p>
        </div>
        <ScrollArea className="max-h-80">
          {!isLoading && threads.length === 0 && (
            <p className="px-4 py-10 text-center text-[13px] text-muted-foreground">
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
                <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-chart-1/12">
                  <MessageSquareText className="size-3.5 text-chart-1" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-[13.5px] font-medium tracking-[-0.01em]">
                      {thread.guest_name}
                    </p>
                    <Badge variant="secondary" className="shrink-0 tabular-nums">
                      {thread.unread_count}
                    </Badge>
                  </div>
                  <p className="truncate text-[11.5px] text-muted-foreground">
                    {thread.hotel_name}
                  </p>
                  <p className="mt-1 truncate text-[12px] text-foreground/75">
                    {thread.last_message}
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground/70">
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
