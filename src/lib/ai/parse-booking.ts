import { runToolCall } from "./run-tool-call";
import { EXTRACTION_SYSTEM_PROMPT } from "./prompts/extraction-system-prompt";
import {
  bookingExtractionSchema,
  bookingExtractionTool,
  type BookingExtraction,
} from "./schemas/booking-extraction";

export async function parseBookingText(rawText: string): Promise<BookingExtraction> {
  if (!rawText.trim()) {
    throw new Error("الرجاء لصق نص الحجز أولاً");
  }

  return runToolCall({
    system: EXTRACTION_SYSTEM_PROMPT,
    userMessage: rawText,
    tool: bookingExtractionTool,
    schema: bookingExtractionSchema,
  });
}
