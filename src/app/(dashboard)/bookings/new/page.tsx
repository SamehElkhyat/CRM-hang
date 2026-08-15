import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
      <div>
        <h1 className="text-2xl font-bold">إضافة حجز يدوياً</h1>
        <p className="text-sm text-muted-foreground">
          أدخل بيانات الحجز مباشرة بدون تحليل بالذكاء الاصطناعي — الفندق واسم الضيف
          مطلوبان فقط، وباقي الحقول اختيارية.
        </p>
      </div>

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
