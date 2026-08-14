import { NextResponse } from "next/server";
import { requireAuthedSupabase } from "@/lib/auth/require-auth";
import { sendBookingEmail } from "@/lib/email/send-booking-email";

export const maxDuration = 60;

export async function POST(request: Request) {
  const auth = await requireAuthedSupabase();
  if (!auth.ok) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const draftId = typeof body?.draft_id === "string" ? body.draft_id : "";
  if (!draftId) {
    return NextResponse.json({ error: "draft_id مطلوب" }, { status: 400 });
  }

  const { data: draft, error: fetchError } = await auth.supabase
    .from("email_drafts")
    .select("id, subject, body, status, booking_id, bookings(id, hotels(reservation_email, sales_email))")
    .eq("id", draftId)
    .single();

  if (fetchError || !draft) {
    return NextResponse.json({ error: "المسودة غير موجودة" }, { status: 404 });
  }

  if (draft.status === "sent") {
    return NextResponse.json({ error: "تم إرسال هذه المسودة بالفعل" }, { status: 409 });
  }

  const hotel = (draft.bookings as unknown as {
    hotels: { reservation_email: string | null; sales_email: string | null } | null;
  } | null)?.hotels;

  if (!hotel?.reservation_email) {
    return NextResponse.json(
      { error: "لا يوجد بريد حجوزات مسجل لهذا الفندق" },
      { status: 400 },
    );
  }

  try {
    const messageId = await sendBookingEmail({
      to: hotel.reservation_email,
      cc: hotel.sales_email ? [hotel.sales_email] : undefined,
      subject: draft.subject,
      body: draft.body,
    });

    const sentAt = new Date().toISOString();

    const { error: updateDraftError } = await auth.supabase
      .from("email_drafts")
      .update({ status: "sent", sent_at: sentAt, resend_message_id: messageId })
      .eq("id", draftId);

    if (updateDraftError) {
      return NextResponse.json({ error: updateDraftError.message }, { status: 500 });
    }

    await auth.supabase
      .from("bookings")
      .update({ status: "sent" })
      .eq("id", draft.booking_id);

    return NextResponse.json({ data: { ok: true, messageId } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "فشل إرسال البريد";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
