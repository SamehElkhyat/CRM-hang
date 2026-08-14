import { NextResponse } from "next/server";
import { requireAuthedSupabase } from "@/lib/auth/require-auth";
import { checkDuplicateBooking } from "@/lib/duplicates/check-duplicate-booking";

export async function POST(request: Request) {
  const auth = await requireAuthedSupabase();
  if (!auth.ok) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const hotelId = typeof body?.hotel_id === "string" ? body.hotel_id : "";
  const guestName = typeof body?.guest_name === "string" ? body.guest_name : "";
  const checkIn = typeof body?.check_in === "string" ? body.check_in : "";
  const checkOut = typeof body?.check_out === "string" ? body.check_out : "";

  if (!hotelId || !guestName || !checkIn || !checkOut) {
    return NextResponse.json(
      { error: "بيانات ناقصة للتحقق من التكرار" },
      { status: 400 },
    );
  }

  const { data, error } = await checkDuplicateBooking(auth.supabase, {
    hotelId,
    guestName,
    checkIn,
    checkOut,
  });

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json({ data });
}
