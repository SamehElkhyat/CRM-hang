// Shared constants for the booking-attachments Storage bucket — kept in one
// place since both the uploader's client-side validation and the bucket's
// own server-side limits (supabase/migrations/0006_booking_attachments.sql)
// need to agree.

export const ATTACHMENTS_BUCKET = "booking-attachments";

export const ALLOWED_ATTACHMENT_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
] as const;

export const MAX_ATTACHMENT_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export function isAllowedAttachmentType(mimeType: string): boolean {
  return (ALLOWED_ATTACHMENT_TYPES as readonly string[]).includes(mimeType);
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
