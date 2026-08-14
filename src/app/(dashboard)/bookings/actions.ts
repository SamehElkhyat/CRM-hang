"use server";

import { revalidatePath } from "next/cache";
import { requireAuthedSupabase } from "@/lib/auth/require-auth";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";
import { bookingInputSchema } from "@/lib/validations/booking";
import type { BookingStatus } from "@/types/database.types";

export async function createBooking(
  input: unknown,
): Promise<{ data?: { id: string }; error?: string }> {
  const auth = await requireAuthedSupabase();
  if (!auth.ok) return { error: "غير مصرح" };

  const parsed = bookingInputSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "بيانات غير صحيحة" };
  }

  const { data, error } = await auth.supabase
    .from("bookings")
    .insert({ ...parsed.data, created_by: auth.userId })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/bookings");
  revalidatePath("/");
  return { data: { id: data.id } };
}

export async function updateBookingStatus(
  bookingId: string,
  status: BookingStatus,
): Promise<{ error?: string }> {
  const auth = await requireAuthedSupabase();
  if (!auth.ok) return { error: "غير مصرح" };

  const { error } = await auth.supabase
    .from("bookings")
    .update({ status })
    .eq("id", bookingId);

  if (error) return { error: error.message };

  revalidatePath(`/bookings/${bookingId}`);
  revalidatePath("/bookings");
  revalidatePath("/");
  return {};
}

export async function softDeleteBooking(
  bookingId: string,
): Promise<{ error?: string }> {
  const admin = await requireAdmin();
  if (!admin.ok) return { error: "غير مصرح" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("bookings")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", bookingId);

  if (error) return { error: error.message };

  revalidatePath("/bookings");
  revalidatePath("/");
  return {};
}
