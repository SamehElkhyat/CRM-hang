"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Save, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DraftEditor } from "./draft-editor";
import { updateDraftContent } from "@/app/(dashboard)/bookings/[id]/email/actions";
import type { Database } from "@/types/database.types";

type EmailDraft = Database["public"]["Tables"]["email_drafts"]["Row"];

export function ActiveDraftPanel({
  draft,
  bookingId,
  reservationEmailConfigured,
  onDraftUpdated,
}: {
  draft: EmailDraft;
  bookingId: string;
  reservationEmailConfigured: boolean;
  onDraftUpdated: (patch: Partial<EmailDraft>) => void;
}) {
  const router = useRouter();

  // Initialized directly from `draft` on mount — this component is remounted
  // via a `key={draft.id}` from the parent whenever the active draft changes,
  // so no effect is needed to keep this in sync.
  const [subject, setSubject] = useState(draft.subject);
  const [body, setBody] = useState(draft.body);
  const [dirty, setDirty] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const isReadOnly = draft.status === "sent";

  async function handleSave() {
    if (!subject.trim() || !body.trim()) {
      toast.error("الرجاء إدخال عنوان ونص الرسالة قبل الحفظ");
      return;
    }
    setIsSaving(true);
    try {
      const result = await updateDraftContent(draft.id, bookingId, { subject, body });
      if (result.error) throw new Error(result.error);
      onDraftUpdated({ subject, body });
      setDirty(false);
      toast.success("تم حفظ المسودة");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "فشل الحفظ");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSend() {
    if (!subject.trim() || !body.trim()) {
      toast.error("الرسالة فارغة — أضف عنواناً ونصاً قبل الإرسال");
      return;
    }
    if (dirty) {
      toast.error("احفظ التعديلات أولاً قبل الإرسال");
      return;
    }
    if (!window.confirm("هل أنت متأكد من إرسال هذا البريد للفندق؟")) return;

    setIsSending(true);
    try {
      const res = await fetch("/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draft_id: draft.id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "فشل إرسال البريد");

      onDraftUpdated({ status: "sent" });
      toast.success("تم إرسال البريد بنجاح");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "فشل إرسال البريد");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <Card className="glass-panel">
      <CardHeader>
        <CardTitle>مسودة الرد</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <DraftEditor
          subject={subject}
          body={body}
          readOnly={isReadOnly}
          onSubjectChange={(v) => {
            setSubject(v);
            setDirty(true);
          }}
          onBodyChange={(v) => {
            setBody(v);
            setDirty(true);
          }}
        />
        {!isReadOnly && (
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleSave} disabled={isSaving || !dirty} variant="outline" size="sm">
              {isSaving ? <Loader2 className="animate-spin" /> : <Save />}
              حفظ
            </Button>
            <Button
              onClick={handleSend}
              disabled={isSending || !reservationEmailConfigured}
              size="sm"
              className="glow-primary-hover ms-auto"
            >
              {isSending ? <Loader2 className="animate-spin" /> : <Send />}
              إرسال البريد
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
