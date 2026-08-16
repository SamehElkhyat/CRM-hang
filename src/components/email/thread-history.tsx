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
    <div className="flex flex-col gap-1.5">
      {drafts.map((d) => {
        const isActive = d.id === activeDraftId;
        return (
          <button
            key={d.id}
            type="button"
            onClick={() => onSelect(d.id)}
            className={cn(
              "group/draft relative flex flex-col gap-1 rounded-lg border px-3 py-2.5 text-start transition-all duration-300",
              isActive
                ? "border-[var(--hairline-strong)] bg-accent/70"
                : "border-transparent hover:border-[var(--hairline)] hover:bg-accent/40",
            )}
          >
            {isActive && (
              <span className="absolute inset-y-2.5 start-0 w-[2px] rounded-full bg-foreground" />
            )}
            <div className="flex items-center gap-2">
              {d.status === "sent" ? (
                <CheckCircle2 className="size-3.5 shrink-0 text-chart-3" />
              ) : (
                <FileText className="size-3.5 shrink-0 text-muted-foreground" />
              )}
              <span className="truncate text-[13px] font-medium">
                {d.subject || "(بدون عنوان)"}
              </span>
            </div>
            <span className="ps-5 text-[11px] text-muted-foreground">
              {STATUS_LABEL[d.status]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
