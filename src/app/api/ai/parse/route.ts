import { NextResponse } from "next/server";
import { requireAuthedSupabase } from "@/lib/auth/require-auth";
import { parseBookingText } from "@/lib/ai/parse-booking";

export const maxDuration = 60;

export async function POST(request: Request) {
  const auth = await requireAuthedSupabase();
  if (!auth.ok) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const rawText = typeof body?.raw_text === "string" ? body.raw_text : "";

  try {
    const extraction = await parseBookingText(rawText);
    return NextResponse.json({ data: extraction });
  } catch (error) {
    const message = error instanceof Error ? error.message : "فشل تحليل النص";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
