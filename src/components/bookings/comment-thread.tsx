"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { format, isToday, isYesterday } from "date-fns";
import { ar } from "date-fns/locale";
import { FileText, ImageIcon, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { markBookingRead, postComment } from "@/app/(dashboard)/bookings/actions";
import { formatFileSize } from "@/lib/storage/booking-attachments";
import { useOpenAttachment } from "./attachments-list";
import { useBookingFiles } from "./booking-files-context";

export interface CommentWithAuthor {
  id: string;
  booking_id: string;
  author_id: string | null;
  message: string;
  is_system: boolean;
  created_at: string;
  author_name: string | null;
}

function dayLabel(date: Date) {
  if (isToday(date)) return "اليوم";
  if (isYesterday(date)) return "أمس";
  return format(date, "d MMMM yyyy", { locale: ar });
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
  const { files } = useBookingFiles();
  const { openingId, openAttachment } = useOpenAttachment();

  // Messages and uploaded files in the order they happened.
  const timeline = [
    ...comments.map((comment) => ({ at: comment.created_at, comment, file: null })),
    ...files.map((file) => ({ at: file.created_at, comment: null, file })),
  ].sort((a, b) => Date.parse(a.at) - Date.parse(b.at));
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
  }, [timeline.length]);

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
    <div className="glass-panel flex h-[34rem] flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-[var(--hairline)] px-5 py-3.5">
        <h2 className="text-sm font-semibold">المحادثة</h2>
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="size-2 rounded-full bg-chart-3" aria-hidden />
          مباشر
        </span>
      </div>

      <ScrollArea className="flex-1 px-5 py-4">
        <div className="flex flex-col gap-4">
          {timeline.length === 0 && (
            <p className="py-12 text-sm leading-relaxed text-muted-foreground">
              لا توجد رسائل بعد.
              <br />
              ابدأ المحادثة مع الفريق حول هذا الحجز.
            </p>
          )}

          {timeline.map(({ at, comment: c, file }, index) => {
            const date = new Date(at);
            const startsDay =
              index === 0 ||
              new Date(timeline[index - 1].at).toDateString() !== date.toDateString();
            let item: React.ReactNode;

            if (file) {
              const Icon = file.file_type.startsWith("image/") ? ImageIcon : FileText;
              item = (
                <div className="flex flex-col items-start gap-1">
                  <span className="px-1 text-xs font-medium text-muted-foreground">
                    {file.uploader_name ?? "عضو الفريق"} رفع ملف
                  </span>
                  <button
                    type="button"
                    onClick={() => openAttachment(file)}
                    disabled={openingId === file.id}
                    title={`فتح ${file.file_name}`}
                    className="flex w-full max-w-[86%] items-center gap-3 rounded-lg border border-[var(--hairline-strong)] px-3 py-2 text-start transition-colors duration-150 ease-out hover:bg-accent/60 focus-visible:outline-2 focus-visible:outline-ring"
                  >
                    {openingId === file.id ? (
                      <Loader2 className="size-5 shrink-0 animate-spin text-muted-foreground" />
                    ) : (
                      <Icon className="size-5 shrink-0 text-muted-foreground" aria-hidden />
                    )}
                    <span className="min-w-0 flex-1">
                      <span dir="auto" className="block truncate text-sm font-medium">
                        {file.file_name}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {formatFileSize(file.file_size)} · اضغط للفتح
                      </span>
                    </span>
                  </button>
                  <span className="px-1 text-xs tabular-nums text-muted-foreground">
                    {format(date, "HH:mm")}
                  </span>
                </div>
              );
            } else if (c.is_system) {
              item = (
                <div className="flex items-center gap-3 py-0.5 text-xs text-muted-foreground">
                  <span className="h-px flex-1 bg-[var(--hairline)]" />
                  <span className="whitespace-nowrap rounded-full border border-[var(--hairline)] bg-muted/50 px-2.5 py-0.5">
                    {c.message}
                  </span>
                  <span className="h-px flex-1 bg-[var(--hairline)]" />
                </div>
              );
            } else {
              const isMine = c.author_id === currentUserId;
              item = (
                <div className={cn("flex flex-col gap-1", isMine ? "items-end" : "items-start")}>
                  <span className="px-1 text-xs font-medium text-muted-foreground">
                    {isMine ? "أنت" : (c.author_name ?? "عضو الفريق")}
                  </span>
                  <div
                    className={cn(
                      "max-w-[86%] whitespace-pre-wrap px-3.5 py-2.5 text-sm leading-relaxed",
                      isMine
                        ? "rounded-[16px_16px_4px_16px] bg-primary text-primary-foreground"
                        : "rounded-[16px_16px_16px_4px] border border-[var(--hairline)] bg-muted/60",
                    )}
                  >
                    {c.message}
                  </div>
                  <span className="px-1 text-xs tabular-nums text-muted-foreground">
                    {format(date, "HH:mm")}
                  </span>
                </div>
              );
            }

            return (
              <Fragment key={file ? `file-${file.id}` : `message-${c.id}`}>
                {startsDay && (
                  <p className="text-center text-xs font-medium text-muted-foreground">
                    {dayLabel(date)}
                  </p>
                )}
                {item}
              </Fragment>
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
