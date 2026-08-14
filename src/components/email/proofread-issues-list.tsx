import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ProofreadIssue } from "@/types/database.types";

export function ProofreadIssuesList({
  issues,
  onApplyCorrection,
}: {
  issues: ProofreadIssue[];
  onApplyCorrection: () => void;
}) {
  if (issues.length === 0) {
    return (
      <p className="text-sm text-chart-3">لا توجد ملاحظات لغوية — النص سليم ✓</p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col gap-2 text-sm">
        {issues.map((issue, i) => (
          <li key={i} className="rounded-lg border border-border/60 p-3">
            <p className="text-destructive line-through">{issue.original}</p>
            <p className="text-chart-3">{issue.suggestion}</p>
            <p className="mt-1 text-xs text-muted-foreground">{issue.reason}</p>
          </li>
        ))}
      </ul>
      <Button variant="outline" size="sm" onClick={onApplyCorrection} className="self-start">
        <Sparkles />
        تطبيق كل التصحيحات
      </Button>
    </div>
  );
}
