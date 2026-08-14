import { z } from "zod";
import type { Anthropic } from "@anthropic-ai/sdk";

export const auditDiscrepancySchema = z.object({
  field: z.string(),
  raw_value: z.string(),
  draft_value: z.string(),
  severity: z.enum(["low", "medium", "high"]),
  explanation: z.string(),
});

export const auditComparisonSchema = z.object({
  discrepancies: z.array(auditDiscrepancySchema),
  overall_risk: z.enum(["none", "low", "medium", "high"]),
  summary: z.string(),
});

export type AuditComparisonResult = z.infer<typeof auditComparisonSchema>;

export const auditComparisonTool: Anthropic.Tool = {
  name: "report_audit_comparison",
  description:
    "Compare a drafted reply email against the original raw booking text and report any discrepancies (dates, price, room, guest name, etc).",
  input_schema: {
    type: "object",
    properties: {
      discrepancies: {
        type: "array",
        items: {
          type: "object",
          properties: {
            field: { type: "string", description: "الحقل المتأثر (مثال: تاريخ الوصول)" },
            raw_value: { type: "string", description: "القيمة كما وردت في النص الأصلي" },
            draft_value: { type: "string", description: "القيمة كما وردت في المسودة" },
            severity: { type: "string", enum: ["low", "medium", "high"] },
            explanation: { type: "string", description: "شرح مختصر للفرق وأثره" },
          },
          required: ["field", "raw_value", "draft_value", "severity", "explanation"],
        },
      },
      overall_risk: { type: "string", enum: ["none", "low", "medium", "high"] },
      summary: { type: "string", description: "ملخص عام بجملة أو جملتين" },
    },
    required: ["discrepancies", "overall_risk", "summary"],
  },
};
