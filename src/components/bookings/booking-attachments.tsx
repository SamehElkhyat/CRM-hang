"use client";

import { useState } from "react";
import { AttachmentUploader } from "./attachment-uploader";
import { AttachmentsList, type AttachmentWithUploader } from "./attachments-list";

export function BookingAttachments({
  bookingId,
  attachments,
  currentUserName,
}: {
  bookingId: string;
  attachments: AttachmentWithUploader[];
  currentUserName: string | null;
}) {
  const [items, setItems] = useState(attachments);

  return (
    <div className="glass-panel animate-fade-in-up overflow-hidden" style={{ animationDelay: "300ms" }}>
      <p className="eyebrow border-b border-[var(--hairline)] px-5 py-3.5">المرفقات</p>
      <div className="flex flex-col gap-4 p-5">
        <AttachmentUploader
          bookingId={bookingId}
          onUploaded={(attachment) =>
            setItems((prev) => [
              { ...attachment, uploader_name: currentUserName },
              ...prev,
            ])
          }
        />
        <AttachmentsList attachments={items} />
      </div>
    </div>
  );
}
