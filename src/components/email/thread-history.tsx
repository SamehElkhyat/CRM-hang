import { CheckCircle2, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Database } from "@/types/database.types";

type EmailDraft = Database["public"]["Tables"]["email_drafts"]["Row"];

const STATUS_LABEL: Record<EmailDraft["status"], string> = {
  draft: "مسودة",
  proofread: "تم التدقيق اللغوي",
  audited: "تم التدقيق المقارن",
  sent: "تم الإرسال",
};

export function ThreadHistory({
  drafts,
  activeDraftId,
  onSelect,
}: {
  drafts: EmailDraft[];
  activeDraftId: string | null;
  onSelect: (draftId: string) => void;
}) {
  if (drafts.length === 0) {
    return <p className="text-sm text-muted-foreground">لا توجد مسودات سابقة.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {drafts.map((d) => (
        <button
          key={d.id}
          type="button"
          onClick={() => onSelect(d.id)}
          className={cn(
            "flex items-center justify-between rounded-lg border px-3 py-2 text-start text-sm transition-colors",
            d.id === activeDraftId
              ? "border-primary bg-primary/5"
              : "border-border/60 hover:bg-accent/40",
          )}
        >
          <div className="flex items-center gap-2">
            {d.status === "sent" ? (
              <CheckCircle2 className="size-3.5 text-chart-3" />
            ) : (
              <FileText className="size-3.5 text-muted-foreground" />
            )}
            <span className="truncate">{d.subject || "(بدون عنوان)"}</span>
          </div>
          <span className="shrink-0 text-xs text-muted-foreground">
            {STATUS_LABEL[d.status]}
          </span>
        </button>
      ))}
    </div>
  );
}
