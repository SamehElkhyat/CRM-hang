import { NextResponse } from "next/server";
import { requireAuthedSupabase } from "@/lib/auth/require-auth";
import { generateDraftEmail } from "@/lib/ai/draft-email";
import { calculateBookingCost } from "@/lib/cost/calculate-cost";

export const maxDuration = 60;

export async function POST(request: Request) {
  const auth = await requireAuthedSupabase();
  if (!auth.ok) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const bookingId = typeof body?.booking_id === "string" ? body.booking_id : "";
  if (!bookingId) {
    return NextResponse.json({ error: "booking_id مطلوب" }, { status: 400 });
  }

  const { data: booking, error: fetchError } = await auth.supabase
    .from("bookings")
    .select("*, hotels(name, child_policy)")
    .eq("id", bookingId)
    .single();

  if (fetchError || !booking) {
    return NextResponse.json({ error: "الحجز غير موجود" }, { status: 404 });
  }

  const hotel = booking.hotels as unknown as {
    name: string;
    child_policy: { currency?: string };
  } | null;

  try {
    const cost = calculateBookingCost({
      checkIn: booking.check_in,
      checkOut: booking.check_out,
      baseRate: booking.rate,
      childrenAges: booking.children_ages,
      childPolicy: hotel?.child_policy ?? {},
    });

    const currency = hotel?.child_policy?.currency ?? "EGP";

    const draft = await generateDraftEmail({
      hotelName: hotel?.name ?? "",
      guestName: booking.guest_name,
      checkIn: booking.check_in,
      checkOut: booking.check_out,
      roomCategory: booking.room_category,
      mealPlan: booking.meal_plan,
      childrenAges: booking.children_ages,
      currency,
      cost,
      rawArabicText: booking.raw_arabic_text,
    });

    const { data: draftRow, error: insertError } = await auth.supabase
      .from("email_drafts")
      .insert({
        booking_id: bookingId,
        subject: draft.subject,
        body: draft.body,
        status: "draft",
        created_by: auth.userId,
      })
      .select("*")
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ data: draftRow });
  } catch (error) {
    const message = error instanceof Error ? error.message : "فشل إنشاء المسودة";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
