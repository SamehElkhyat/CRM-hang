import { z } from "zod";
import type { Anthropic } from "@anthropic-ai/sdk";

export const draftEmailSchema = z.object({
  subject: z.string(),
  body: z.string(),
});

export type DraftEmailResult = z.infer<typeof draftEmailSchema>;

export const draftEmailTool: Anthropic.Tool = {
  name: "generate_reply_email",
  description:
    "Generate a professional reply email (subject + body) to a hotel reservations/sales contact confirming a booking's details and final cost.",
  input_schema: {
    type: "object",
    properties: {
      subject: { type: "string", description: "عنوان البريد الإلكتروني" },
      body: { type: "string", description: "نص الرسالة الكامل" },
    },
    required: ["subject", "body"],
  },
};
