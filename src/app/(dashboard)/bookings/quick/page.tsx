import Link from "next/link";
import { QuickBookingForm } from "@/components/bookings/quick-booking-form";

export default function QuickBookingPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">حجز سريع</h1>
          <p className="text-sm text-muted-foreground">
            الصق أي نص للحجز كما هو — من واتساب أو البريد أو أي مصدر — واحفظه فوراً
            بدون تعبئة أي حقول.
          </p>
        </div>
        <Link
          href="/bookings/new"
          className="text-sm text-primary underline underline-offset-2"
        >
          تفضل تعبئة النموذج الكامل؟
        </Link>
      </div>

      <QuickBookingForm />
    </div>
  );
}
