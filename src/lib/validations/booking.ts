import { z } from "zod";

export const bookingInputSchema = z.object({
  hotel_id: z.string().uuid("الرجاء اختيار الفندق"),
  guest_name: z.string().trim().min(1, "اسم الضيف مطلوب"),
  guest_phone: z.string().trim().optional().nullable(),
  check_in: z.string().min(1, "تاريخ الوصول مطلوب"),
  check_out: z.string().min(1, "تاريخ المغادرة مطلوب"),
  room_category: z.string().trim().optional().nullable(),
  meal_plan: z.string().trim().optional().nullable(),
  rate: z.number().nonnegative(),
  total_cost: z.number().nonnegative(),
  children_ages: z.array(z.number().int().nonnegative()).default([]),
  raw_arabic_text: z.string().trim().min(1, "نص الحجز الأصلي مطلوب"),
  entry_type: z.enum(["detailed", "quick"]).default("detailed"),
});

export type BookingInput = z.infer<typeof bookingInputSchema>;
