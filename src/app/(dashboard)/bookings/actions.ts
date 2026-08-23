"use server";

import { revalidatePath } from "next/cache";
import { requireAuthedSupabase } from "@/lib/auth/require-auth";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";
import { bookingInputSchema } from "@/lib/validations/booking";
import { commentInputSchema } from "@/lib/validations/comment";
import { BOOKING_STATUS_LABELS } from "@/lib/booking-status-labels";
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

  // Best-effort: auto-follow your own booking and mark it read, so it
  // doesn't immediately show up as "unread" to its own creator. Neither
  // failure should block booking creation, which already succeeded above.
  const [followResult, readResult] = await Promise.all([
    auth.supabase
      .from("booking_followers")
      .insert({ booking_id: data.id, user_id: auth.userId }),
    auth.supabase
      .from("booking_reads")
      .insert({ booking_id: data.id, user_id: auth.userId }),
  ]);
  if (followResult.error) console.error("[bookings] auto-follow failed:", followResult.error);
  if (readResult.error) console.error("[bookings] auto-read failed:", readResult.error);

  revalidatePath("/bookings");
  revalidatePath("/");
  return { data: { id: data.id } };
}

export async function updateBookingStatus(
  bookingId: string,
  status: BookingStatus,
): Promise<{ error?: string }> {
  const admin = await requireAdmin();
  if (!admin.ok) return { error: "تغيير حالة الحجز متاح للمسؤولين فقط" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("bookings")
    .update({ status })
    .eq("id", bookingId);

  if (error) return { error: error.message };

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", admin.user.id)
    .single();

  const actorName = profile?.full_name || "أحد الأعضاء";
  const { error: commentError } = await supabase.from("booking_comments").insert({
    booking_id: bookingId,
    author_id: admin.user.id,
    is_system: true,
    message: `غيّر ${actorName} حالة الحجز إلى: ${BOOKING_STATUS_LABELS[status]}`,
  });
  if (commentError) {
    console.error("[bookings] status system comment failed:", commentError);
  }

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

export async function postComment(
  bookingId: string,
  message: string,
): Promise<{ error?: string }> {
  const auth = await requireAuthedSupabase();
  if (!auth.ok) return { error: "غير مصرح" };

  const parsed = commentInputSchema.safeParse({ bookingId, message });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "بيانات غير صحيحة" };
  }

  const { error } = await auth.supabase.from("booking_comments").insert({
    booking_id: parsed.data.bookingId,
    author_id: auth.userId,
    message: parsed.data.message,
  });
  if (error) return { error: error.message };

  const { error: readError } = await auth.supabase
    .from("booking_reads")
    .upsert(
      { booking_id: parsed.data.bookingId, user_id: auth.userId, last_read_at: new Date().toISOString() },
      { onConflict: "booking_id,user_id" },
    );
  if (readError) console.error("[bookings] mark-read after comment failed:", readError);

  revalidatePath(`/bookings/${bookingId}`);
  return {};
}

export async function toggleFollow(
  bookingId: string,
  follow: boolean,
): Promise<{ error?: string }> {
  const auth = await requireAuthedSupabase();
  if (!auth.ok) return { error: "غير مصرح" };

  if (follow) {
    const { error } = await auth.supabase
      .from("booking_followers")
      .upsert(
        { booking_id: bookingId, user_id: auth.userId },
        { onConflict: "booking_id,user_id" },
      );
    if (error) return { error: error.message };
  } else {
    const { error } = await auth.supabase
      .from("booking_followers")
      .delete()
      .eq("booking_id", bookingId)
      .eq("user_id", auth.userId);
    if (error) return { error: error.message };
  }

  revalidatePath(`/bookings/${bookingId}`);
  revalidatePath("/bookings");
  return {};
}

export async function markBookingRead(bookingId: string): Promise<{ error?: string }> {
  const auth = await requireAuthedSupabase();
  if (!auth.ok) return { error: "غير مصرح" };

  const { error } = await auth.supabase
    .from("booking_reads")
    .upsert(
      { booking_id: bookingId, user_id: auth.userId, last_read_at: new Date().toISOString() },
      { onConflict: "booking_id,user_id" },
    );
  if (error) return { error: error.message };
  return {};
}
