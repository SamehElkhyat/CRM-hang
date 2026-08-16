import Link from "next/link";
import { AlertTriangle, PenLine } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PageHeader } from "@/components/layout/page-header";
import { ParseWorkspace } from "@/components/parse/parse-workspace";
import { createClient } from "@/lib/supabase/server";

export default async function ParsePage() {
  const supabase = await createClient();
  const { data: hotels, error } = await supabase
    .from("hotels")
    .select("*")
    .eq("is_active", true)
    .order("name");

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="الاستخراج الذكي"
        title="تحليل الحجز"
        description="الصق نص الحجز العربي ليقوم النظام باستخراج البيانات، التحقق من التكرار، وحساب التكلفة تلقائياً"
        actions={
          <Link
            href="/bookings/new"
            className="group inline-flex items-center gap-2 border-b border-[var(--hairline-strong)] pb-1 text-[13px] font-medium text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
          >
            <PenLine className="size-3.5" />
            أو أضف حجزاً يدوياً
          </Link>
        }
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
            أضف فندقاً واحداً على الأقل من دليل الفنادق قبل تحليل الحجوزات.
          </AlertDescription>
        </Alert>
      )}

      <ParseWorkspace hotels={hotels ?? []} />
    </div>
  );
}
