"use client";

import { useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, Loader2, PenLine, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ThreadHistory } from "./thread-history";
import { ActiveDraftPanel } from "./active-draft-panel";
import { createManualDraft } from "@/app/(dashboard)/bookings/[id]/email/actions";
import type { Database } from "@/types/database.types";

type EmailDraft = Database["public"]["Tables"]["email_drafts"]["Row"];

export function EmailStudioWorkspace({
  bookingId,
  initialDrafts,
  reservationEmailConfigured,
}: {
  bookingId: string;
  initialDrafts: EmailDraft[];
  reservationEmailConfigured: boolean;
}) {
  const [drafts, setDrafts] = useState(initialDrafts);
  const [activeDraftId, setActiveDraftId] = useState<string | null>(
    initialDrafts.find((d) => d.status !== "sent")?.id ?? null,
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCreatingManual, setIsCreatingManual] = useState(false);

  const activeDraft = drafts.find((d) => d.id === activeDraftId) ?? null;

  async function handleGenerate() {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/ai/draft-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ booking_id: bookingId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "فشل إنشاء المسودة");

      const newDraft = json.data as EmailDraft;
      setDrafts((prev) => [newDraft, ...prev]);
      setActiveDraftId(newDraft.id);
      toast.success("تم إنشاء مسودة بالذكاء الاصطناعي");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "فشل إنشاء المسودة");
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleManualDraft() {
    setIsCreatingManual(true);
    try {
      const result = await createManualDraft(bookingId);
      if (result.error || !result.data) throw new Error(result.error ?? "فشل إنشاء المسودة");

      setDrafts((prev) => [result.data as EmailDraft, ...prev]);
      setActiveDraftId(result.data.id);
      toast.success("ابدأ الكتابة في المسودة اليدوية");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "فشل إنشاء المسودة");
    } finally {
      setIsCreatingManual(false);
    }
  }

  function handleDraftUpdated(patch: Partial<EmailDraft>) {
    if (!activeDraftId) return;
    setDrafts((prev) =>
      prev.map((d) => (d.id === activeDraftId ? { ...d, ...patch } : d)),
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
      <Card className="glass-panel h-fit">
        <CardHeader>
          <CardTitle>سجل المراسلات</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Button onClick={handleGenerate} disabled={isGenerating} size="sm">
            {isGenerating ? <Loader2 className="animate-spin" /> : <Wand2 />}
            {isGenerating ? "جاري الإنشاء..." : "توليد بالذكاء الاصطناعي"}
          </Button>
          <Button
            onClick={handleManualDraft}
            disabled={isCreatingManual}
            variant="outline"
            size="sm"
          >
            {isCreatingManual ? <Loader2 className="animate-spin" /> : <PenLine />}
            {isCreatingManual ? "جاري الإنشاء..." : "كتابة مسودة يدوياً"}
          </Button>
          <Separator />
          <ThreadHistory
            drafts={drafts}
            activeDraftId={activeDraftId}
            onSelect={setActiveDraftId}
          />
        </CardContent>
      </Card>

      <div className="flex flex-col gap-6">
        {!reservationEmailConfigured && (
          <Alert variant="destructive">
            <AlertTriangle />
            <AlertTitle>لا يوجد بريد حجوزات مسجل لهذا الفندق</AlertTitle>
            <AlertDescription>
              أضف بريد الحجوزات من دليل الفنادق قبل إرسال الرسالة.
            </AlertDescription>
          </Alert>
        )}

        {!activeDraft && (
          <Card className="glass-panel">
            <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
              <p className="text-sm text-muted-foreground">
                لا توجد مسودة نشطة حالياً. اختر &quot;توليد بالذكاء الاصطناعي&quot; أو
                &quot;كتابة مسودة يدوياً&quot; للبدء.
              </p>
            </CardContent>
          </Card>
        )}

        {activeDraft && (
          <ActiveDraftPanel
            key={activeDraft.id}
            draft={activeDraft}
            bookingId={bookingId}
            reservationEmailConfigured={reservationEmailConfigured}
            onDraftUpdated={handleDraftUpdated}
          />
        )}
      </div>
    </div>
  );
}
