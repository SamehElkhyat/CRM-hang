"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { UnreadThread } from "@/types/database.types";

export function useBookingNotifications(currentUserId: string) {
  const [supabase] = useState(() => createClient());
  const [threads, setThreads] = useState<UnreadThread[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refetch = useCallback(async () => {
    const { data, error } = await supabase.rpc("get_unread_booking_comments");
    if (error) {
      console.error("[notifications] failed to fetch unread summary:", error);
      return null;
    }
    const next = data ?? [];
    setThreads(next);
    return next;
  }, [supabase]);

  useEffect(() => {
    // Initial fetch of unread threads from the external system (Supabase) on
    // mount — the canonical data-fetching Effect use case, not derived state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refetch().finally(() => setIsLoading(false));

    const channel = supabase
      .channel("booking-comments-notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "booking_comments" },
        async (payload) => {
          const newComment = payload.new as {
            booking_id: string;
            author_id: string | null;
          };
          // Never notify yourself about your own message.
          if (newComment.author_id === currentUserId) return;

          const next = await refetch();
          if (!next) return;

          // Only toast if this booking is actually relevant to the current
          // user (creator, follower, or admin) — get_unread_booking_comments
          // already applies that filter, so absence means "not for me".
          const relevant = next.find((t) => t.booking_id === newComment.booking_id);
          if (relevant) {
            toast.message(relevant.guest_name, {
              description: `${relevant.hotel_name} — ${relevant.last_message}`,
            });
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, refetch, supabase]);

  const unreadCount = threads.reduce((sum, t) => sum + t.unread_count, 0);

  return { threads, unreadCount, isLoading, refetch };
}
