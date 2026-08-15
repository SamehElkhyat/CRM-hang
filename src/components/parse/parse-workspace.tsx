"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Save, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RawTextInput } from "./raw-text-input";
import { ExtractionReviewForm, type BookingDraft } from "./extraction-review-form";
import { DuplicateWarningCard } from "@/components/bookings/duplicate-warning-card";
import { CostBreakdownTable } from "@/components/bookings/cost-breakdown-table";
import { useBookingDraft, EMPTY_BOOKING_DRAFT } from "@/hooks/use-booking-draft";
import type { Database } from "@/types/database.types";
import type { BookingExtraction } from "@/lib/ai/schemas/booking-extraction";

type Hotel = Database["public"]["Tables"]["hotels"]["Row"];

function matchHotelByName(hotels: Hotel[], name: string | null): Hotel | undefined {
  if (!name) return undefined;
  const normalized = name.trim().toLowerCase();
  return hotels.find(
    (h) =>
      h.name.trim().toLowerCase() === normalized ||
      h.name.trim().toLowerCase().includes(normalized) ||
      normalized.includes(h.name.trim().toLowerCase()),
  );
}

function extractionToDraft(hotels: Hotel[], extraction: BookingExtraction): BookingDraft {
  const matchedHotel = matchHotelByName(hotels, extraction.hotel_name);
  return {
    hotelId: matchedHotel?.id ?? "",
    guestName: extraction.guest_name ?? "",
    guestPhone: extraction.guest_phone ?? "",
    checkIn: extraction.check_in ?? "",
    checkOut: extraction.check_out ?? "",
    roomCategory: extraction.room_category ?? "",
    mealPlan: extraction.meal_plan ?? "",
    rate: extraction.rate != null ? String(extraction.rate) : "",
    currency: extraction.currency ?? "EGP",
    childrenAgesText: extraction.children_ages.join(", "),
    notes: extraction.notes ?? "",
  };
}

export function ParseWorkspace({ hotels }: { hotels: Hotel[] }) {
  const [rawText, setRawText] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [hasParsed, setHasParsed] = useState(false);

  const {
    draft,
    updateDraft,
    resetDraft,
    duplicates,
    isCheckingDuplicates,
    duplicateChecked,
    checkDuplicates,
    cost,
    isSaving,
    save,
  } = useBookingDraft(hotels, EMPTY_BOOKING_DRAFT);

  async function handleParse() {
    setIsParsing(true);
    try {
      const res = await fetch("/api/ai/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raw_text: rawText }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "فشل التحليل");

      const extraction = json.data as BookingExtraction;
      resetDraft(extractionToDraft(hotels, extraction));
      setHasParsed(true);
      toast.success("تم تحليل النص بنجاح، راجع البيانات قبل الحفظ");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "فشل التحليل");
    } finally {
      setIsParsing(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <RawTextInput
        value={rawText}
        onChange={setRawText}
        onParse={handleParse}
        isParsing={isParsing}
      />

      {hasParsed && (
        <>
          <ExtractionReviewForm hotels={hotels} draft={draft} onChange={updateDraft} />

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
                <CardTitle>حساب التكلفة النهائية</CardTitle>
              </CardHeader>
              <CardContent>
                <CostBreakdownTable cost={cost} currency={draft.currency || "EGP"} />
              </CardContent>
            </Card>
          )}

          <Button
            onClick={() => save(rawText)}
            disabled={isSaving}
            className="self-start"
            size="lg"
          >
            {isSaving ? <Loader2 className="animate-spin" /> : <Save />}
            {isSaving ? "جاري الحفظ..." : "حفظ الحجز"}
          </Button>
        </>
      )}
    </div>
  );
}
