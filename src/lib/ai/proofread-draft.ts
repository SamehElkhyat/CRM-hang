import { runToolCall } from "./run-tool-call";
import { PROOFREAD_SYSTEM_PROMPT } from "./prompts/proofread-system-prompt";
import {
  proofreadResultSchema,
  proofreadTool,
  type ProofreadResult,
} from "./schemas/proofread";

export async function proofreadDraft(text: string): Promise<ProofreadResult> {
  return runToolCall({
    system: PROOFREAD_SYSTEM_PROMPT,
    userMessage: text,
    tool: proofreadTool,
    schema: proofreadResultSchema,
  });
}
