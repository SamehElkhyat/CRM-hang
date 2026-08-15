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
  const { threads, unreadCount, isLoading } = useBookingNotifications(currentUserId);

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button variant="ghost" size="icon" aria-label="الإشعارات" className="relative" />
        }
      >
        <Bell className="size-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -end-0.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="border-b border-border/60 px-4 py-3">
          <p className="text-sm font-semibold">الإشعارات</p>
          <p className="text-xs text-muted-foreground">
            رسائل ومستجدات الحجوزات التي تتابعها
          </p>
        </div>
        <ScrollArea className="max-h-80">
          {!isLoading && threads.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
              لا توجد إشعارات جديدة
            </p>
          )}
          <div className="flex flex-col">
            {threads.map((thread) => (
              <Link
                key={thread.booking_id}
                href={`/bookings/${thread.booking_id}`}
                className="flex items-start gap-2.5 border-b border-border/60 px-4 py-3 text-start transition-colors last:border-0 hover:bg-accent/50"
              >
                <MessageSquareText className="mt-0.5 size-4 shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium">{thread.guest_name}</p>
                    <Badge variant="secondary" className="shrink-0">
                      {thread.unread_count}
                    </Badge>
                  </div>
                  <p className="truncate text-xs text-muted-foreground">{thread.hotel_name}</p>
                  <p className="mt-0.5 truncate text-xs text-foreground/80">
                    {thread.last_message}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
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
