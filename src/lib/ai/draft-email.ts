import { runToolCall } from "./run-tool-call";
import { DRAFT_EMAIL_SYSTEM_PROMPT } from "./prompts/draft-email-system-prompt";
import {
  draftEmailSchema,
  draftEmailTool,
  type DraftEmailResult,
} from "./schemas/draft-email";
import type { CostBreakdown } from "@/lib/cost/calculate-cost";

export interface DraftEmailInput {
  hotelName: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  roomCategory: string | null;
  mealPlan: string | null;
  childrenAges: number[];
  currency: string;
  cost: CostBreakdown;
  rawArabicText: string;
}

export async function generateDraftEmail(
  input: DraftEmailInput,
): Promise<DraftEmailResult> {
  const childLines = input.cost.childCharges
    .map((c) => `- طفل بعمر ${c.age}: ${c.reason} — ${c.charge} ${input.currency}`)
    .join("\n");

  const userMessage = [
    `الفندق: ${input.hotelName}`,
    `اسم الضيف: ${input.guestName}`,
    `تاريخ الوصول: ${input.checkIn}`,
    `تاريخ المغادرة: ${input.checkOut}`,
    `عدد الليالي: ${input.cost.nights}`,
    `فئة الغرفة: ${input.roomCategory ?? "—"}`,
    `نظام الإعاشة: ${input.mealPlan ?? "—"}`,
    `تكلفة الغرفة: ${input.cost.roomSubtotal} ${input.currency}`,
    childLines ? `تفاصيل الأطفال:\n${childLines}` : "",
    `التكلفة الإجمالية: ${input.cost.total} ${input.currency}`,
    "",
    "النص الأصلي المرجعي للحجز:",
    input.rawArabicText,
  ]
    .filter(Boolean)
    .join("\n");

  return runToolCall({
    system: DRAFT_EMAIL_SYSTEM_PROMPT,
    userMessage,
    tool: draftEmailTool,
    schema: draftEmailSchema,
    maxTokens: 1536,
  });
}
