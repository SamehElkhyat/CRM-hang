import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, DuplicateCandidate } from "@/types/database.types";

export async function checkDuplicateBooking(
  supabase: SupabaseClient<Database>,
  params: {
    hotelId: string;
    guestName: string;
    checkIn: string;
    checkOut: string;
  },
): Promise<{ data: DuplicateCandidate[]; error: string | null }> {
  const { data, error } = await supabase.rpc("check_duplicate_booking", {
    p_hotel_id: params.hotelId,
    p_guest_name: params.guestName,
    p_check_in: params.checkIn,
    p_check_out: params.checkOut,
  });

  if (error) return { data: [], error: error.message };
  return { data: data ?? [], error: null };
}
