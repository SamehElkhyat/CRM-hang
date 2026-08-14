import Anthropic from "@anthropic-ai/sdk";

let client: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error(
      "ANTHROPIC_API_KEY غير مُهيأ. أضفه في ملف .env.local لتفعيل ميزات الذكاء الاصطناعي.",
    );
  }
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

export const AI_MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5";
