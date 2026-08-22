"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { calculateBookingCost } from "@/lib/cost/calculate-cost";
import { createBooking } from "@/app/(dashboard)/bookings/actions";
import type { BookingDraft } from "@/components/bookings/booking-form-fields";
import type { Database, DuplicateCandidate } from "@/types/database.types";

type Hotel = Database["public"]["Tables"]["hotels"]["Row"];

export const EMPTY_BOOKING_DRAFT: BookingDraft = {
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

function parseChildrenAges(text: string): number[] {
  return text
    .split(",")
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isFinite(n) && n >= 0);
}

// Shared "fill in details → check duplicates → confirm cost → save" logic
// for the manual booking-entry form.
export function useBookingDraft(hotels: Hotel[], initialDraft: BookingDraft = EMPTY_BOOKING_DRAFT) {
  const router = useRouter();
  const [draft, setDraft] = useState<BookingDraft>(initialDraft);
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

  function resetDraft(next: BookingDraft) {
    setDraft(next);
    setDuplicates([]);
    setDuplicateChecked(false);
  }

  async function checkDuplicates() {
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

  async function save(rawText: string) {
    if (!draft.hotelId) {
      toast.error("الرجاء اختيار الفندق");
      return;
    }
    if (!draft.guestName.trim()) {
      toast.error("الرجاء إدخال اسم الضيف");
      return;
    }
    if (!cost) {
      toast.error("الرجاء تحديد تاريخ الوصول والمغادرة");
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
        rate: Number(draft.rate) || 0,
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

  return {
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
  };
}
