import type { Anthropic } from "@anthropic-ai/sdk";
import type { z } from "zod";
import { getAnthropicClient, AI_MODEL } from "./anthropic-client";

export async function runToolCall<T>(options: {
  system: string;
  userMessage: string;
  tool: Anthropic.Tool;
  schema: z.ZodType<T>;
  maxTokens?: number;
}): Promise<T> {
  const anthropic = getAnthropicClient();

  const response = await anthropic.messages.create({
    model: AI_MODEL,
    max_tokens: options.maxTokens ?? 2048,
    system: options.system,
    tools: [options.tool],
    tool_choice: { type: "tool", name: options.tool.name },
    messages: [{ role: "user", content: options.userMessage }],
  });

  const toolUse = response.content.find(
    (block): block is Anthropic.ToolUseBlock => block.type === "tool_use",
  );

  if (!toolUse) {
    throw new Error("لم يُرجع النموذج نتيجة منظمة. حاول مرة أخرى.");
  }

  const parsed = options.schema.safeParse(toolUse.input);
  if (!parsed.success) {
    throw new Error(
      `استجابة الذكاء الاصطناعي لا تطابق الصيغة المتوقعة: ${parsed.error.issues[0]?.message}`,
    );
  }

  return parsed.data;
}
