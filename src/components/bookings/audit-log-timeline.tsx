import { History, PlusCircle, Pencil } from "lucide-react";
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
    <div className="glass-panel animate-fade-in-up overflow-hidden" style={{ animationDelay: "300ms" }}>
      <p className="eyebrow flex items-center gap-2 border-b border-[var(--hairline)] px-5 py-3.5">
        <History className="size-3.5" />
        سجل التعديلات
      </p>
      <div className="p-5">
        {error && (
          <p className="text-[13px] text-destructive">تعذر تحميل السجل: {error.message}</p>
        )}
        {!error && (!logs || logs.length === 0) && (
          <p className="py-4 text-[13px] text-muted-foreground">
            لا توجد تعديلات مسجلة بعد.
          </p>
        )}

        <div className="relative flex flex-col">
          {/* continuous spine behind the nodes */}
          {logs && logs.length > 0 && (
            <span
              aria-hidden
              className="absolute inset-y-2 start-[7px] w-px bg-[var(--hairline)]"
            />
          )}

          {logs?.map((log) => {
            const changes =
              log.change_type === "update"
                ? diffFields(
                    log.old_data as Record<string, unknown> | null,
                    log.new_data as Record<string, unknown> | null,
                  )
                : [];
            const actor =
              (log.profiles as unknown as { full_name: string | null } | null)
                ?.full_name || "عضو الفريق";
            const isInsert = log.change_type === "insert";

            return (
              <div key={log.id} className="relative flex gap-4 pb-5 last:pb-0">
                <div
                  className={`relative z-10 mt-0.5 flex size-[15px] shrink-0 items-center justify-center rounded-full ring-4 ring-[var(--card)] ${
                    isInsert ? "bg-chart-3/15" : "bg-chart-4/15"
                  }`}
                >
                  {isInsert ? (
                    <PlusCircle className="size-3 text-chart-3" />
                  ) : (
                    <Pencil className="size-[10px] text-chart-4" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[13.5px] font-medium tracking-[-0.005em]">
                    {isInsert ? "تم إنشاء الحجز" : "تم تعديل الحجز"}
                    <span className="ms-1.5 font-normal text-muted-foreground">
                      بواسطة {actor}
                    </span>
                  </p>
                  <p className="mt-0.5 text-[11.5px] tabular-nums text-muted-foreground/80">
                    {new Date(log.timestamp).toLocaleString("ar-EG")}
                  </p>

                  {changes.length > 0 && (
                    <ul className="mt-2 flex flex-col gap-1 rounded-lg border border-[var(--hairline)] bg-muted/40 px-3 py-2">
                      {changes.map((c) => (
                        <li key={c.field} className="text-[12px]">
                          <span className="text-muted-foreground">
                            {FIELD_LABELS[c.field] ?? c.field}:{" "}
                          </span>
                          <span className="text-muted-foreground/70 line-through">
                            {formatValue(c.from)}
                          </span>
                          <span className="mx-1.5 text-muted-foreground/50">←</span>
                          <span className="font-medium">{formatValue(c.to)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
