import { History, PlusCircle, Pencil } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

const FIELD_LABELS: Record<string, string> = {
  guest_name: "اسم الضيف",
  guest_phone: "رقم الهاتف",
  check_in: "تاريخ الوصول",
  check_out: "تاريخ المغادرة",
  room_category: "فئة الغرفة",
  meal_plan: "نظام الإعاشة",
  rate: "السعر لليلة",
  total_cost: "التكلفة الإجمالية",
  status: "الحالة",
  children_ages: "أعمار الأطفال",
  hotel_id: "الفندق",
};

const SKIP_FIELDS = new Set([
  "updated_at",
  "created_at",
  "normalized_guest_name",
  "raw_arabic_text",
  "created_by",
  "id",
]);

function diffFields(
  oldData: Record<string, unknown> | null,
  newData: Record<string, unknown> | null,
) {
  if (!oldData || !newData) return [];
  const keys = new Set([...Object.keys(oldData), ...Object.keys(newData)]);
  const changes: { field: string; from: unknown; to: unknown }[] = [];
  for (const key of keys) {
    if (SKIP_FIELDS.has(key)) continue;
    if (JSON.stringify(oldData[key]) !== JSON.stringify(newData[key])) {
      changes.push({ field: key, from: oldData[key], to: newData[key] });
    }
  }
  return changes;
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (Array.isArray(value)) return value.length ? value.join(", ") : "—";
  return String(value);
}

export async function AuditLogTimeline({ bookingId }: { bookingId: string }) {
  const supabase = await createClient();
  const { data: logs, error } = await supabase
    .from("audit_logs")
    .select("id, change_type, old_data, new_data, timestamp, profiles(full_name)")
    .eq("booking_id", bookingId)
    .order("timestamp", { ascending: false });

  return (
    <Card className="glass-panel">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="size-4" />
          سجل التعديلات
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && <p className="text-sm text-destructive">تعذر تحميل السجل: {error.message}</p>}
        {!error && (!logs || logs.length === 0) && (
          <p className="text-sm text-muted-foreground">لا توجد تعديلات مسجلة بعد.</p>
        )}
        <div className="flex flex-col gap-4">
          {logs?.map((log) => {
            const changes =
              log.change_type === "update"
                ? diffFields(
                    log.old_data as Record<string, unknown> | null,
                    log.new_data as Record<string, unknown> | null,
                  )
                : [];
            const actor =
              (log.profiles as unknown as { full_name: string | null } | null)?.full_name ||
              "عضو الفريق";

            return (
              <div key={log.id} className="flex gap-3 border-s-2 border-border ps-4">
                <div className="mt-0.5">
                  {log.change_type === "insert" ? (
                    <PlusCircle className="size-4 text-chart-3" />
                  ) : (
                    <Pencil className="size-4 text-chart-4" />
                  )}
                </div>
                <div className="flex-1 text-sm">
                  <p className="font-medium">
                    {log.change_type === "insert" ? "تم إنشاء الحجز" : "تم تعديل الحجز"}
                    <span className="ms-1 font-normal text-muted-foreground">
                      بواسطة {actor}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(log.timestamp).toLocaleString("ar-EG")}
                  </p>
                  {changes.length > 0 && (
                    <ul className="mt-1.5 flex flex-col gap-0.5 text-xs">
                      {changes.map((c) => (
                        <li key={c.field}>
                          <span className="text-muted-foreground">
                            {FIELD_LABELS[c.field] ?? c.field}:{" "}
                          </span>
                          {formatValue(c.from)} ← {formatValue(c.to)}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
