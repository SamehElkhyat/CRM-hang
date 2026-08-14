import { z } from "zod";
import type { Anthropic } from "@anthropic-ai/sdk";

export const bookingExtractionSchema = z.object({
  hotel_name: z.string().nullable(),
  reservation_email: z.string().nullable(),
  sales_email: z.string().nullable(),
  guest_name: z.string().nullable(),
  guest_phone: z.string().nullable(),
  check_in: z.string().nullable().describe("ISO date, yyyy-mm-dd"),
  check_out: z.string().nullable().describe("ISO date, yyyy-mm-dd"),
  room_category: z.string().nullable(),
  meal_plan: z.string().nullable(),
  rate: z.number().nullable(),
  currency: z.string().nullable(),
  children_ages: z.array(z.number()),
  notes: z.string().nullable(),
});

export type BookingExtraction = z.infer<typeof bookingExtractionSchema>;

export const bookingExtractionTool: Anthropic.Tool = {
  name: "extract_booking_details",
  description:
    "Extract structured hotel reservation details from raw Arabic booking text.",
  input_schema: {
    type: "object",
    properties: {
      hotel_name: { type: ["string", "null"], description: "اسم الفندق" },
      reservation_email: {
        type: ["string", "null"],
        description: "بريد قسم الحجوزات في الفندق",
      },
      sales_email: {
        type: ["string", "null"],
        description: "بريد قسم المبيعات في الفندق",
      },
      guest_name: { type: ["string", "null"], description: "اسم الضيف" },
      guest_phone: { type: ["string", "null"], description: "رقم هاتف الضيف إن وُجد" },
      check_in: {
        type: ["string", "null"],
        description: "تاريخ الوصول بصيغة yyyy-mm-dd",
      },
      check_out: {
        type: ["string", "null"],
        description: "تاريخ المغادرة بصيغة yyyy-mm-dd",
      },
      room_category: { type: ["string", "null"], description: "فئة الغرفة" },
      meal_plan: {
        type: ["string", "null"],
        description: "نظام الإعاشة (مثال: نصف إقامة، إفطار فقط، الكل شامل)",
      },
      rate: { type: ["number", "null"], description: "السعر لليلة الواحدة" },
      currency: { type: ["string", "null"], description: "عملة السعر" },
      children_ages: {
        type: "array",
        items: { type: "number" },
        description: "أعمار الأطفال المذكورة في الحجز، إن وُجدت",
      },
      notes: {
        type: ["string", "null"],
        description: "أي تفاصيل إضافية مهمة لم تُغطها الحقول أعلاه",
      },
    },
    required: [
      "hotel_name",
      "reservation_email",
      "sales_email",
      "guest_name",
      "guest_phone",
      "check_in",
      "check_out",
      "room_category",
      "meal_plan",
      "rate",
      "currency",
      "children_ages",
      "notes",
    ],
  },
};
