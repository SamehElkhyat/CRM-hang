"use server";

import { revalidatePath } from "next/cache";
import { requireAuthedSupabase } from "@/lib/auth/require-auth";

export async function updateDraftContent(
  draftId: string,
  bookingId: string,
  patch: { subject: string; body: string },
): Promise<{ error?: string }> {
  const auth = await requireAuthedSupabase();
  if (!auth.ok) return { error: "غير مصرح" };

  const { error } = await auth.supabase
    .from("email_drafts")
    .update({ subject: patch.subject, body: patch.body })
    .eq("id", draftId);

  if (error) return { error: error.message };

  revalidatePath(`/bookings/${bookingId}/email`);
  return {};
}
