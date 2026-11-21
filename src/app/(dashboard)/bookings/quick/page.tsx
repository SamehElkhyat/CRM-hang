import Link from "next/link";
import { QuickBookingForm } from "@/components/bookings/quick-booking-form";
import { PageHeader } from "@/components/layout/page-header";

export default function QuickBookingPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="حجز سريع"
        description="الصق نص الحجز كما وصلك من واتساب أو البريد أو أي مصدر آخر، واحفظه فوراً بدون تعبئة أي حقول."
        actions={
          <Link href="/bookings/new" className="text-sm text-primary underline underline-offset-4">
            تفضل تعبئة النموذج الكامل؟
          </Link>
        }
      />

      <QuickBookingForm />
    </div>
  );
}
