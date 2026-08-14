import { NextResponse } from "next/server";
import { requireAuthedSupabase } from "@/lib/auth/require-auth";
import { auditCompareDraft } from "@/lib/ai/audit-compare";

export const maxDuration = 60;

export async function POST(request: Request) {
  const auth = await requireAuthedSupabase();
  if (!auth.ok) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const draftId = typeof body?.draft_id === "string" ? body.draft_id : "";
  if (!draftId) {
    return NextResponse.json({ error: "draft_id مطلوب" }, { status: 400 });
  }

  const { data: draft, error: fetchError } = await auth.supabase
    .from("email_drafts")
    .select("id, subject, body, status, bookings(raw_arabic_text)")
    .eq("id", draftId)
    .single();

  if (fetchError || !draft) {
    return NextResponse.json({ error: "المسودة غير موجودة" }, { status: 404 });
  }

  const rawText = (draft.bookings as unknown as { raw_arabic_text: string } | null)
    ?.raw_arabic_text;

  if (!rawText) {
    return NextResponse.json({ error: "تعذر العثور على النص الأصلي للحجز" }, { status: 404 });
  }

  try {
    const result = await auditCompareDraft(rawText, draft.subject, draft.body);

    const nextStatus = draft.status === "sent" ? draft.status : "audited";
    const { error: updateError } = await auth.supabase
      .from("email_drafts")
      .update({ audit_comparison: result, status: nextStatus })
      .eq("id", draftId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ data: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "فشل التدقيق المقارن";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
