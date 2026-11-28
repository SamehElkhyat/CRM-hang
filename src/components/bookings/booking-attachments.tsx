"use client";

import { AttachmentUploader } from "./attachment-uploader";
import { AttachmentsList } from "./attachments-list";
import { useBookingFiles } from "./booking-files-context";

export function BookingAttachments({
  bookingId,
  currentUserName,
}: {
  bookingId: string;
  currentUserName: string | null;
}) {
  const { files, addFile } = useBookingFiles();

  return (
    <div className="glass-panel overflow-hidden">
      <h2 className="border-b border-[var(--hairline)] px-5 py-3 text-sm font-semibold">المرفقات</h2>
      <div className="flex flex-col gap-4 p-5">
        <AttachmentUploader
          bookingId={bookingId}
          onUploaded={(attachment) =>
            addFile({ ...attachment, uploader_name: currentUserName })
          }
        />
        <AttachmentsList attachments={files} />
      </div>
    </div>
  );
}
