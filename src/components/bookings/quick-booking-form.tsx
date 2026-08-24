"use client";

import { Loader2, Save, Zap } from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBookingDraft, EMPTY_BOOKING_DRAFT } from "@/hooks/use-booking-draft";

// The one fixed hotel row every quick booking is filed under when no real
// hotel is picked (supabase/migrations/0007_quick_booking_placeholder_hotel.sql).
// Inactive, so it never shows up in the normal hotel directory picker.
// Must be the exact nil UUID — Zod's .uuid() validator (booking.ts) only
// special-cases 00000000-0000-0000-0000-000000000000 itself as valid;
// any other all-zero-looking id fails its version/variant nibble check.
const PLACEHOLDER_HOTEL_ID = "00000000-0000-0000-0000-000000000000";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function tomorrowIso(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

function deriveGuestName(pastedText: string): string {
  const firstLine = pastedText.trim().split("\n")[0]?.trim() ?? "";
  return firstLine.slice(0, 60) || "حجز سريع بدون تفاصيل";
}

// No hotel, guest, phone, or dates to fill in — just paste and save. The
// database still requires those columns, so they're filled in silently with
// a fixed placeholder hotel, today/tomorrow as a placeholder stay, and a
// guest-name derived from the first line of the pasted text (so entries are
// still distinguishable in the bookings list). Because those values aren't
// real, duplicate-check wouldn't mean anything here, so it isn't offered on
// this form — use the full "إضافة حجز" form when you want that check.
export function QuickBookingForm() {
  const { draft, updateDraft, isSaving, save } = useBookingDraft([], {
    ...EMPTY_BOOKING_DRAFT,
    hotelId: PLACEHOLDER_HOTEL_ID,
    checkIn: todayIso(),
    checkOut: tomorrowIso(),
  });

  // Keep guestName derived in the same state update as the pasted text
  // itself — computing it separately right before save() would read a
  // stale draft, since React state updates aren't synchronous.
  function handleNotesChange(value: string) {
    updateDraft({ notes: value, guestName: deriveGuestName(value) });
  }

  function handleSave() {
    const text = draft.notes.trim();
    if (!text) {
      toast.error("الرجاء لصق نص الحجز أولاً");
      return;
    }
    save(text, "quick");
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className="glass-panel">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="size-4 text-primary" />
            حجز سريع
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={draft.notes}
            onChange={(e) => handleNotesChange(e.target.value)}
            placeholder="الصق أي نص من واتساب أو البريد أو أي مصدر آخر..."
            className="min-h-64 resize-y"
            dir="rtl"
            autoFocus
          />
        </CardContent>
      </Card>

      <Button
        onClick={handleSave}
        disabled={isSaving}
        className="glow-primary-hover self-start"
        size="lg"
      >
        {isSaving ? <Loader2 className="animate-spin" /> : <Save />}
        {isSaving ? "جاري الحفظ..." : "حفظ الحجز السريع"}
      </Button>
    </div>
  );
}
