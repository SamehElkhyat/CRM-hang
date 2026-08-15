import { z } from "zod";

export const commentInputSchema = z.object({
  bookingId: z.string().uuid(),
  message: z.string().trim().min(1, "لا يمكن إرسال رسالة فارغة").max(4000, "الرسالة طويلة جداً"),
});
