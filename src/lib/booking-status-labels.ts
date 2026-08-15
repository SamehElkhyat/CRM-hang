import type { BookingStatus } from "@/types/database.types";

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  pending: "قيد المراجعة",
  confirmed: "مؤكد",
  sent: "تم الإرسال",
  cancelled: "ملغى",
};
