"use client";

import { Loader2, Save, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExtractionReviewForm } from "@/components/parse/extraction-review-form";
import { DuplicateWarningCard } from "@/components/bookings/duplicate-warning-card";
import { CostBreakdownTable } from "@/components/bookings/cost-breakdown-table";
import { useBookingDraft } from "@/hooks/use-booking-draft";
import type { Database } from "@/types/database.types";

type Hotel = Database["public"]["Tables"]["hotels"]["Row"];

export function ManualBookingForm({ hotels }: { hotels: Hotel[] }) {
  const {
    draft,
    updateDraft,
    duplicates,
    isCheckingDuplicates,
    duplicateChecked,
    checkDuplicates,
    cost,
    isSaving,
    save,
  } = useBookingDraft(hotels);

  function handleSave() {
    const hotelName = hotels.find((h) => h.id === draft.hotelId)?.name ?? "";
    const description = draft.notes.trim();
    // This form has no pasted source text (that's the whole point) — fall
    // back to a short synthesized summary so the booking still has a
    // human-readable record of how it was created.
    const rawText =
      description ||
      [
        "حجز تم إدخاله يدوياً",
        `الضيف: ${draft.guestName}`,
        draft.guestPhone ? `الهاتف: ${draft.guestPhone}` : null,
        hotelName ? `الفندق: ${hotelName}` : null,
      ]
        .filter(Boolean)
        .join(" — ");

    save(rawText);
  }

  return (
    <div className="flex flex-col gap-6">
      <ExtractionReviewForm
        hotels={hotels}
        draft={draft}
        onChange={updateDraft}
        title="بيانات الحجز"
      />

      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" onClick={checkDuplicates} disabled={isCheckingDuplicates}>
          {isCheckingDuplicates ? <Loader2 className="animate-spin" /> : <ShieldCheck />}
          التحقق من التكرار
        </Button>
        {duplicateChecked && duplicates.length === 0 && (
          <span className="text-sm text-chart-3">لا توجد حجوزات مشابهة ✓</span>
        )}
      </div>

      <DuplicateWarningCard candidates={duplicates} />

      {cost && (
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle>حساب التكلفة (اختياري)</CardTitle>
          </CardHeader>
          <CardContent>
            <CostBreakdownTable cost={cost} currency={draft.currency || "EGP"} />
          </CardContent>
        </Card>
      )}

      <Button
        onClick={handleSave}
        disabled={isSaving}
        className="glow-primary-hover self-start"
        size="lg"
      >
        {isSaving ? <Loader2 className="animate-spin" /> : <Save />}
        {isSaving ? "جاري الحفظ..." : "حفظ الحجز"}
      </Button>
    </div>
  );
}
