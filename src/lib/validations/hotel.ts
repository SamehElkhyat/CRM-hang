import { z } from "zod";

export const roomTypeSchema = z.object({
  name: z.string().min(1, "اسم الغرفة مطلوب"),
  base_rate: z.number().nonnegative(),
});

export const childPolicySchema = z.object({
  currency: z.string().optional(),
  free_age_limit: z.number().nonnegative().optional(),
  extra_bed: z
    .object({
      min_age: z.number().nonnegative(),
      max_age: z.number().nonnegative(),
      charge: z.number().nonnegative(),
    })
    .optional(),
  adult_extra_bed_charge: z.number().nonnegative().optional(),
});

const optionalEmail = z
  .string()
  .trim()
  .refine((v) => v === "" || z.string().email().safeParse(v).success, {
    message: "بريد إلكتروني غير صحيح",
  })
  .optional();

export const hotelSchema = z.object({
  name: z.string().trim().min(1, "اسم الفندق مطلوب"),
  hotline: z.string().trim().optional(),
  reservation_email: optionalEmail,
  sales_email: optionalEmail,
  finance_email: optionalEmail,
  room_types: z.array(roomTypeSchema).default([]),
  child_policy: childPolicySchema.default({}),
});

export type HotelInput = z.infer<typeof hotelSchema>;
