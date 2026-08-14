import { runToolCall } from "./run-tool-call";
import { AUDIT_SYSTEM_PROMPT } from "./prompts/audit-system-prompt";
import {
  auditComparisonSchema,
  auditComparisonTool,
  type AuditComparisonResult,
} from "./schemas/audit-comparison";

export async function auditCompareDraft(
  rawArabicText: string,
  draftSubject: string,
  draftBody: string,
): Promise<AuditComparisonResult> {
  const userMessage = [
    "النص الأصلي للحجز:",
    rawArabicText,
    "",
    "مسودة البريد الإلكتروني:",
    `العنوان: ${draftSubject}`,
    draftBody,
  ].join("\n");

  return runToolCall({
    system: AUDIT_SYSTEM_PROMPT,
    userMessage,
    tool: auditComparisonTool,
    schema: auditComparisonSchema,
  });
}
