"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Save, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RawTextInput } from "./raw-text-input";
import { ExtractionReviewForm, type BookingDraft } from "./extraction-review-form";
import { DuplicateWarningCard } from "@/components/bookings/duplicate-warning-card";
import { CostBreakdownTable } from "@/components/bookings/cost-breakdown-table";
import { calculateBookingCost } from "@/lib/cost/calculate-cost";
import { createBooking } from "@/app/(dashboard)/bookings/actions";
import type { Database, DuplicateCandidate } from "@/types/database.types";
import type { BookingExtraction } from "@/lib/ai/schemas/booking-extraction";

type Hotel = Database["public"]["Tables"]["hotels"]["Row"];

const EMPTY_DRAFT: BookingDraft = {
  hotelId: "",
  guestName: "",
  guestPhone: "",
  checkIn: "",
  checkOut: "",
  roomCategory: "",
  mealPlan: "",
  rate: "",
  currency: "EGP",
  childrenAgesText: "",
  notes: "",
};

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

function parseChildrenAges(text: string): number[] {
  return text
    .split(",")
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isFinite(n) && n >= 0);
}

export function ParseWorkspace({ hotels }: { hotels: Hotel[] }) {
  const router = useRouter();
  const [rawText, setRawText] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [draft, setDraft] = useState<BookingDraft>(EMPTY_DRAFT);
  const [hasParsed, setHasParsed] = useState(false);

  const [duplicates, setDuplicates] = useState<DuplicateCandidate[]>([]);
  const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false);
  const [duplicateChecked, setDuplicateChecked] = useState(false);

  const [isSaving, setIsSaving] = useState(false);

  const selectedHotel = hotels.find((h) => h.id === draft.hotelId);
  const childrenAges = useMemo(
    () => parseChildrenAges(draft.childrenAgesText),
    [draft.childrenAgesText],
  );

  const cost = useMemo(() => {
    const rate = Number(draft.rate);
    if (!draft.checkIn || !draft.checkOut || !Number.isFinite(rate)) return null;
    try {
      return calculateBookingCost({
        checkIn: draft.checkIn,
        checkOut: draft.checkOut,
        baseRate: rate,
        childrenAges,
        childPolicy: selectedHotel?.child_policy ?? {},
      });
    } catch {
      return null;
    }
  }, [draft.checkIn, draft.checkOut, draft.rate, childrenAges, selectedHotel]);

  function updateDraft(patch: Partial<BookingDraft>) {
    setDraft((prev) => ({ ...prev, ...patch }));
    setDuplicateChecked(false);
  }

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
      setDraft(extractionToDraft(hotels, extraction));
      setHasParsed(true);
      toast.success("تم تحليل النص بنجاح، راجع البيانات قبل الحفظ");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "فشل التحليل");
    } finally {
      setIsParsing(false);
    }
  }

  async function handleCheckDuplicates() {
    if (!draft.hotelId || !draft.guestName || !draft.checkIn || !draft.checkOut) {
      toast.error("أكمل الفندق واسم الضيف والتواريخ أولاً للتحقق من التكرار");
      return;
    }
    setIsCheckingDuplicates(true);
    try {
      const res = await fetch("/api/duplicate-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hotel_id: draft.hotelId,
          guest_name: draft.guestName,
          check_in: draft.checkIn,
          check_out: draft.checkOut,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "فشل التحقق من التكرار");
      setDuplicates(json.data ?? []);
      setDuplicateChecked(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "فشل التحقق من التكرار");
    } finally {
      setIsCheckingDuplicates(false);
    }
  }

  async function handleSave() {
    if (!draft.hotelId) {
      toast.error("الرجاء اختيار الفندق");
      return;
    }
    if (!cost) {
      toast.error("أكمل التواريخ والسعر لحساب التكلفة أولاً");
      return;
    }

    setIsSaving(true);
    try {
      const result = await createBooking({
        hotel_id: draft.hotelId,
        guest_name: draft.guestName,
        guest_phone: draft.guestPhone || null,
        check_in: draft.checkIn,
        check_out: draft.checkOut,
        room_category: draft.roomCategory || null,
        meal_plan: draft.mealPlan || null,
        rate: Number(draft.rate),
        total_cost: cost.total,
        children_ages: childrenAges,
        raw_arabic_text: rawText,
      });

      if (result.error) throw new Error(result.error);
      toast.success("تم حفظ الحجز بنجاح");
      if (result.data) router.push(`/bookings/${result.data.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "فشل حفظ الحجز");
    } finally {
      setIsSaving(false);
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
            <Button variant="outline" onClick={handleCheckDuplicates} disabled={isCheckingDuplicates}>
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

          <Button onClick={handleSave} disabled={isSaving} className="self-start" size="lg">
            {isSaving ? <Loader2 className="animate-spin" /> : <Save />}
            {isSaving ? "جاري الحفظ..." : "حفظ الحجز"}
          </Button>
        </>
      )}
    </div>
  );
}
