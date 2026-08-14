import { z } from "zod";
import type { Anthropic } from "@anthropic-ai/sdk";

export const proofreadIssueSchema = z.object({
  original: z.string(),
  suggestion: z.string(),
  reason: z.string(),
});

export const proofreadResultSchema = z.object({
  issues: z.array(proofreadIssueSchema),
  corrected_text: z.string(),
});

export type ProofreadResult = z.infer<typeof proofreadResultSchema>;

export const proofreadTool: Anthropic.Tool = {
  name: "report_proofread_results",
  description:
    "Proofread an Arabic/English business email draft for grammar, spelling, and clarity issues, and provide a corrected version.",
  input_schema: {
    type: "object",
    properties: {
      issues: {
        type: "array",
        items: {
          type: "object",
          properties: {
            original: { type: "string", description: "النص الأصلي الذي به خطأ" },
            suggestion: { type: "string", description: "التصحيح المقترح" },
            reason: { type: "string", description: "سبب التصحيح (نحوي، إملائي، وضوح...)" },
          },
          required: ["original", "suggestion", "reason"],
        },
      },
      corrected_text: {
        type: "string",
        description: "النص الكامل بعد تطبيق كل التصحيحات",
      },
    },
    required: ["issues", "corrected_text"],
  },
};
