import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { QuickBookingForm } from "@/components/bookings/quick-booking-form";
import { createClient } from "@/lib/supabase/server";

export default async function QuickBookingPage() {
  const supabase = await createClient();
  const { data: hotels, error } = await supabase
    .from("hotels")
    .select("*")
    .eq("is_active", true)
    .order("name");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">حجز سريع</h1>
          <p className="text-sm text-muted-foreground">
            الصق أي نص للحجز كما هو — من واتساب أو البريد أو أي مصدر — بدون الحاجة
            لملء كل التفاصيل. فقط الفندق واسم الضيف والتواريخ مطلوبة.
          </p>
        </div>
        <Link
          href="/bookings/new"
          className="text-sm text-primary underline underline-offset-2"
        >
          تفضل تعبئة النموذج الكامل؟
        </Link>
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

      <QuickBookingForm hotels={hotels ?? []} />
    </div>
  );
}
