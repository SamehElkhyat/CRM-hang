import { QuickBookingForm } from "@/components/bookings/quick-booking-form";
import { EntryModeSwitch } from "@/components/bookings/entry-mode-switch";
import { PageHeader } from "@/components/layout/page-header";

export default function QuickBookingPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="حجز سريع"
        description="الصق نص الحجز كما وصلك من واتساب أو البريد أو أي مصدر آخر، واحفظه فوراً بدون تعبئة أي حقول."
        actions={<EntryModeSwitch active="quick" />}
      />

      <QuickBookingForm />
    </div>
  );
}
