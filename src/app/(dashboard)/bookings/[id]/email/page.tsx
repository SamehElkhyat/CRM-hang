import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { EmailStudioWorkspace } from "@/components/email/email-studio-workspace";
import { createClient } from "@/lib/supabase/server";

export default async function EmailStudioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: booking } = await supabase
    .from("bookings")
    .select("id, guest_name, hotels(name, reservation_email)")
    .eq("id", id)
    .single();

  if (!booking) notFound();

  const { data: drafts } = await supabase
    .from("email_drafts")
    .select("*")
    .eq("booking_id", id)
    .order("created_at", { ascending: false });

  const hotel = booking.hotels as unknown as {
    name: string;
    reservation_email: string | null;
  } | null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href={`/bookings/${id}`}
          className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowRight className="size-3.5" />
          العودة لتفاصيل الحجز
        </Link>
        <h1 className="text-2xl font-bold">استوديو البريد</h1>
        <p className="text-sm text-muted-foreground">
          {booking.guest_name} · {hotel?.name ?? "—"}
        </p>
      </div>

      <EmailStudioWorkspace
        bookingId={id}
        initialDrafts={drafts ?? []}
        reservationEmailConfigured={Boolean(hotel?.reservation_email)}
      />
    </div>
  );
}
