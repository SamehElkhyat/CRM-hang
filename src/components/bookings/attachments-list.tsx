"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNowStrict } from "date-fns";
import { ar } from "date-fns/locale";
import { FileText, ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { ATTACHMENTS_BUCKET, formatFileSize } from "@/lib/storage/booking-attachments";

export interface AttachmentWithUploader {
  id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  created_at: string;
  uploader_name: string | null;
}

function AttachmentThumbnail({ filePath, fileType }: { filePath: string; fileType: string }) {
  const [supabase] = useState(() => createClient());
  const [thumbUrl, setThumbUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!fileType.startsWith("image/")) return;
    let cancelled = false;
    supabase.storage
      .from(ATTACHMENTS_BUCKET)
      .createSignedUrl(filePath, 300)
      .then(({ data }) => {
        if (!cancelled && data) setThumbUrl(data.signedUrl);
      });
    return () => {
      cancelled = true;
    };
  }, [filePath, fileType, supabase]);

  if (fileType.startsWith("image/")) {
    return (
      <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted/60">
        {thumbUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumbUrl} alt="" className="size-full object-cover" />
        ) : (
          <ImageIcon className="size-4 text-muted-foreground" />
        )}
      </div>
    );
  }

  return (
    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted/60">
      <FileText className="size-4 text-muted-foreground" />
    </div>
  );
}

export function AttachmentsList({
  attachments,
}: {
  attachments: AttachmentWithUploader[];
}) {
  const [supabase] = useState(() => createClient());
  const [openingId, setOpeningId] = useState<string | null>(null);

  async function handleOpen(attachment: AttachmentWithUploader) {
    setOpeningId(attachment.id);
    try {
      const { data, error } = await supabase.storage
        .from(ATTACHMENTS_BUCKET)
        .createSignedUrl(attachment.file_path, 60);
      if (error || !data) throw new Error(error?.message ?? "تعذر فتح الملف");
      window.open(data.signedUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذر فتح الملف");
    } finally {
      setOpeningId(null);
    }
  }

  if (attachments.length === 0) {
    return (
      <p className="py-6 text-center text-[13px] text-muted-foreground">
        لا توجد مرفقات بعد.
      </p>
    );
  }

  return (
    <ul className="flex flex-col">
      {attachments.map((attachment) => (
        <li key={attachment.id}>
          <button
            type="button"
            onClick={() => handleOpen(attachment)}
            disabled={openingId === attachment.id}
            className="row-interactive flex w-full items-center gap-3 border-b border-[var(--hairline)] px-5 py-3 text-start last:border-0"
          >
            <AttachmentThumbnail
              filePath={attachment.file_path}
              fileType={attachment.file_type}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13.5px] font-medium">{attachment.file_name}</p>
              <p className="mt-0.5 truncate text-[11.5px] text-muted-foreground">
                {formatFileSize(attachment.file_size)}
                {attachment.uploader_name ? ` · ${attachment.uploader_name}` : ""} ·{" "}
                {formatDistanceToNowStrict(new Date(attachment.created_at), {
                  addSuffix: true,
                  locale: ar,
                })}
              </p>
            </div>
            {openingId === attachment.id && (
              <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" />
            )}
          </button>
        </li>
      ))}
    </ul>
  );
}
