"use server";

import { revalidatePath } from "next/cache";
import { requireAuthedSupabase } from "@/lib/auth/require-auth";
import type { Database } from "@/types/database.types";

type Attachment = Database["public"]["Tables"]["booking_attachments"]["Row"];

// Records the metadata row after the binary itself has already been
// uploaded directly from the browser to Supabase Storage (the bucket's own
// policies govern that upload — this just makes the file discoverable /
// listed against the booking).
export async function recordAttachment(
  bookingId: string,
  meta: { file_name: string; file_path: string; file_type: string; file_size: number },
): Promise<{ data?: Attachment; error?: string }> {
  const auth = await requireAuthedSupabase();
  if (!auth.ok) return { error: "غير مصرح" };

  const { data, error } = await auth.supabase
    .from("booking_attachments")
    .insert({
      booking_id: bookingId,
      uploaded_by: auth.userId,
      file_name: meta.file_name,
      file_path: meta.file_path,
      file_type: meta.file_type,
      file_size: meta.file_size,
    })
    .select("*")
    .single();

  if (error) return { error: error.message };

  revalidatePath(`/bookings/${bookingId}`);
  return { data };
}
