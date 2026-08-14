import { Badge } from "@/components/ui/badge";
import type { AuditComparisonResult } from "@/lib/ai/schemas/audit-comparison";

const SEVERITY_STYLE: Record<string, string> = {
  low: "bg-chart-4/15 text-chart-4 border-chart-4/30",
  medium: "bg-chart-5/15 text-chart-5 border-chart-5/30",
  high: "bg-destructive/10 text-destructive border-destructive/30",
};

const RISK_LABEL: Record<string, string> = {
  none: "لا يوجد تعارض",
  low: "خطر منخفض",
  medium: "خطر متوسط",
  high: "خطر مرتفع",
};

export function AuditDiffView({ result }: { result: AuditComparisonResult }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Badge
          variant="outline"
          className={SEVERITY_STYLE[result.overall_risk] ?? ""}
        >
          {RISK_LABEL[result.overall_risk] ?? result.overall_risk}
        </Badge>
        <p className="text-sm text-muted-foreground">{result.summary}</p>
      </div>

      {result.discrepancies.length > 0 && (
        <ul className="flex flex-col gap-2 text-sm">
          {result.discrepancies.map((d, i) => (
            <li key={i} className="rounded-lg border border-border/60 p-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">{d.field}</span>
                <Badge variant="outline" className={SEVERITY_STYLE[d.severity] ?? ""}>
                  {d.severity}
                </Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                الأصل: {d.raw_value} — المسودة: {d.draft_value}
              </p>
              <p className="mt-1 text-xs">{d.explanation}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
