"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { markBookingRead, postComment } from "@/app/(dashboard)/bookings/actions";

export interface CommentWithAuthor {
  id: string;
  booking_id: string;
  author_id: string | null;
  message: string;
  is_system: boolean;
  created_at: string;
  author_name: string | null;
}

export function CommentThread({
  bookingId,
  currentUserId,
  initialComments,
}: {
  bookingId: string;
  currentUserId: string;
  initialComments: CommentWithAuthor[];
}) {
  const [supabase] = useState(() => createClient());
  const [comments, setComments] = useState(initialComments);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const authorNamesRef = useRef<Record<string, string>>(
    Object.fromEntries(
      initialComments
        .filter((c): c is CommentWithAuthor & { author_id: string } => Boolean(c.author_id))
        .map((c) => [c.author_id, c.author_name ?? "عضو الفريق"]),
    ),
  );

  useEffect(() => {
    markBookingRead(bookingId);
  }, [bookingId]);

  useEffect(() => {
    const channel = supabase
      .channel(`booking-comments-${bookingId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "booking_comments",
          filter: `booking_id=eq.${bookingId}`,
        },
        async (payload) => {
          const row = payload.new as Omit<CommentWithAuthor, "author_name">;

          let authorName = row.author_id ? authorNamesRef.current[row.author_id] : null;
          if (!authorName && row.author_id) {
            const { data } = await supabase
              .from("profiles")
              .select("full_name")
              .eq("id", row.author_id)
              .single();
            authorName = data?.full_name ?? "عضو الفريق";
            authorNamesRef.current[row.author_id] = authorName;
          }

          setComments((prev) =>
            prev.some((c) => c.id === row.id)
              ? prev
              : [...prev, { ...row, author_name: authorName ?? null }],
          );
          markBookingRead(bookingId);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [bookingId, supabase]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments.length]);

  async function handleSend() {
    const text = message.trim();
    if (!text) return;
    setIsSending(true);
    setMessage("");
    const result = await postComment(bookingId, text);
    if (result.error) {
      toast.error(result.error);
      setMessage(text);
    }
    setIsSending(false);
  }

  return (
    <div className="glass-panel animate-fade-in-up flex h-[34rem] flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-[var(--hairline)] px-5 py-3.5">
        <p className="eyebrow">المحادثة</p>
        <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span className="size-1.5 animate-pulse rounded-full bg-chart-3" />
          مباشر
        </span>
      </div>

      <ScrollArea className="flex-1 px-5 py-4">
        <div className="flex flex-col gap-4">
          {comments.length === 0 && (
            <p className="py-12 text-center text-[13px] leading-relaxed text-muted-foreground">
              لا توجد رسائل بعد.
              <br />
              ابدأ المحادثة مع الفريق حول هذا الحجز.
            </p>
          )}

          {comments.map((c) => {
            if (c.is_system) {
              return (
                <div
                  key={c.id}
                  className="flex items-center gap-3 py-0.5 text-[11px] text-muted-foreground"
                >
                  <span className="h-px flex-1 bg-[var(--hairline)]" />
                  <span className="whitespace-nowrap rounded-full border border-[var(--hairline)] bg-muted/50 px-2.5 py-0.5">
                    {c.message}
                  </span>
                  <span className="h-px flex-1 bg-[var(--hairline)]" />
                </div>
              );
            }

            const isMine = c.author_id === currentUserId;
            return (
              <div
                key={c.id}
                className={cn(
                  "animate-fade-in-up flex flex-col gap-1",
                  isMine ? "items-end" : "items-start",
                )}
              >
                <span className="px-1 text-[11px] font-medium text-muted-foreground">
                  {isMine ? "أنت" : (c.author_name ?? "عضو الفريق")}
                </span>
                <div
                  className={cn(
                    "max-w-[86%] whitespace-pre-wrap px-3.5 py-2.5 text-[13.5px] leading-relaxed",
                    isMine
                      ? "rounded-[16px_16px_4px_16px] bg-primary text-primary-foreground"
                      : "rounded-[16px_16px_16px_4px] border border-[var(--hairline)] bg-muted/60",
                  )}
                >
                  {c.message}
                </div>
                <span className="px-1 text-[10px] tabular-nums text-muted-foreground/70">
                  {format(new Date(c.created_at), "HH:mm")}
                </span>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      <div className="flex items-end gap-2 border-t border-[var(--hairline)] bg-background/40 p-3">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="اكتب رسالة..."
          className="max-h-32 min-h-10 resize-none border-transparent bg-muted/50"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <Button
          size="icon"
          onClick={handleSend}
          disabled={isSending || !message.trim()}
          aria-label="إرسال"
          className="shrink-0"
        >
          <Send className="size-4" />
        </Button>
      </div>
    </div>
  );
}
