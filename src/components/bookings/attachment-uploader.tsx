"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Loader2, UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { recordAttachment } from "@/app/(dashboard)/bookings/[id]/attachments/actions";
import {
  ATTACHMENTS_BUCKET,
  MAX_ATTACHMENT_SIZE_BYTES,
  formatFileSize,
  isAllowedAttachmentType,
} from "@/lib/storage/booking-attachments";
import type { Database } from "@/types/database.types";

type Attachment = Database["public"]["Tables"]["booking_attachments"]["Row"];

function sanitizeFileName(name: string): string {
  return name.replace(/[^\w.\-]+/g, "_");
}

export function AttachmentUploader({
  bookingId,
  onUploaded,
}: {
  bookingId: string;
  onUploaded: (attachment: Attachment) => void;
}) {
  const [supabase] = useState(() => createClient());
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingCount, setUploadingCount] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  async function uploadOne(file: File) {
    if (!isAllowedAttachmentType(file.type)) {
      toast.error(`${file.name}: نوع الملف غير مدعوم (PDF أو PNG أو JPG فقط)`);
      return;
    }
    if (file.size > MAX_ATTACHMENT_SIZE_BYTES) {
      toast.error(`${file.name}: الحجم أكبر من الحد المسموح (10 ميجابايت)`);
      return;
    }

    setUploadingCount((n) => n + 1);
    try {
      const path = `${bookingId}/${crypto.randomUUID()}-${sanitizeFileName(file.name)}`;
      const { error: uploadError } = await supabase.storage
        .from(ATTACHMENTS_BUCKET)
        .upload(path, file, { contentType: file.type });

      if (uploadError) throw new Error(uploadError.message);

      const result = await recordAttachment(bookingId, {
        file_name: file.name,
        file_path: path,
        file_type: file.type,
        file_size: file.size,
      });
      if (result.error || !result.data) throw new Error(result.error ?? "فشل حفظ الملف");

      onUploaded(result.data);
      toast.success(`تم رفع ${file.name}`);
    } catch (error) {
      toast.error(
        `${file.name}: ${error instanceof Error ? error.message : "فشل الرفع"}`,
      );
    } finally {
      setUploadingCount((n) => n - 1);
    }
  }

  function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    Array.from(fileList).forEach((file) => uploadOne(file));
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        handleFiles(e.dataTransfer.files);
      }}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-5 py-8 text-center transition-all duration-300",
        isDragging
          ? "glow-primary border-primary bg-primary/5"
          : "border-[var(--hairline-strong)] hover:border-primary/40 hover:bg-accent/30",
      )}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="application/pdf,image/png,image/jpeg"
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
      {uploadingCount > 0 ? (
        <Loader2 className="size-6 animate-spin text-primary" />
      ) : (
        <UploadCloud className="size-6 text-muted-foreground" />
      )}
      <p className="text-[13.5px] font-medium">
        {uploadingCount > 0
          ? `جاري رفع ${uploadingCount} ملف...`
          : "اسحب الملفات هنا أو اضغط للاختيار"}
      </p>
      <p className="text-[11.5px] text-muted-foreground">
        PDF أو PNG أو JPG — حتى {formatFileSize(MAX_ATTACHMENT_SIZE_BYTES)}
      </p>
    </div>
  );
}
