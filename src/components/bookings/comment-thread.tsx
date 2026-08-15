"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card className="glass-panel flex h-[32rem] flex-col">
      <CardHeader>
        <CardTitle>المحادثة</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3 overflow-hidden">
        <ScrollArea className="flex-1 pe-2">
          <div className="flex flex-col gap-3">
            {comments.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">
                لا توجد رسائل بعد. ابدأ المحادثة مع الفريق حول هذا الحجز.
              </p>
            )}
            {comments.map((c) =>
              c.is_system ? (
                <div key={c.id} className="flex items-center gap-2 py-1 text-xs text-muted-foreground">
                  <div className="h-px flex-1 bg-border" />
                  <span className="whitespace-nowrap">{c.message}</span>
                  <div className="h-px flex-1 bg-border" />
                </div>
              ) : (
                <div
                  key={c.id}
                  className={cn(
                    "flex flex-col gap-0.5",
                    c.author_id === currentUserId ? "items-end" : "items-start",
                  )}
                >
                  <span className="text-[11px] text-muted-foreground">
                    {c.author_id === currentUserId ? "أنت" : c.author_name ?? "عضو الفريق"}
                  </span>
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap",
                      c.author_id === currentUserId
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted",
                    )}
                  >
                    {c.message}
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {format(new Date(c.created_at), "HH:mm")}
                  </span>
                </div>
              ),
            )}
            <div ref={bottomRef} />
          </div>
        </ScrollArea>
        <div className="flex items-end gap-2 border-t border-border/60 pt-3">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="اكتب رسالة..."
            className="min-h-10 resize-none"
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
          >
            <Send className="size-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
