import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">تحليل الحجز</h1>
        <p className="text-sm text-muted-foreground">
          الصق نص الحجز العربي ليقوم النظام باستخراج البيانات، التحقق من التكرار،
          وحساب التكلفة تلقائياً
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
            أضف فندقاً واحداً على الأقل من دليل الفنادق قبل تحليل الحجوزات.
          </AlertDescription>
        </Alert>
      )}

      <ParseWorkspace hotels={hotels ?? []} />
    </div>
  );
}
