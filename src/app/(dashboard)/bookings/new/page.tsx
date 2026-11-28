import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { EntryModeSwitch } from "@/components/bookings/entry-mode-switch";
import { PageHeader } from "@/components/layout/page-header";
import { ManualBookingForm } from "@/components/bookings/manual-booking-form";
import { createClient } from "@/lib/supabase/server";

export default async function NewBookingPage() {
  const supabase = await createClient();
  const { data: hotels, error } = await supabase
    .from("hotels")
    .select("*")
    .eq("is_active", true)
    .order("name");

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="إضافة حجز"
        description="املأ الحقول المعلّمة بنجمة، والباقي اختياري."
        actions={<EntryModeSwitch active="detailed" />}
      />

      {error && (
        <Alert variant="destructive">
          <AlertTriangle />
          <AlertTitle>تعذر تحميل قائمة الفنادق</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      {!error && hotels && hotels.length === 0 && (
        <Alert>
          <AlertTriangle />
          <AlertTitle>لا توجد فنادق مسجلة</AlertTitle>
          <AlertDescription>
            أضف فندقاً واحداً على الأقل من دليل الفنادق قبل إضافة حجز.
          </AlertDescription>
        </Alert>
      )}

      <ManualBookingForm hotels={hotels ?? []} />
    </div>
  );
}
