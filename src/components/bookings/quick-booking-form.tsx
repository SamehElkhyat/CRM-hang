"use client";

import { Loader2, Save, ShieldCheck, Zap } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DuplicateWarningCard } from "@/components/bookings/duplicate-warning-card";
import { useBookingDraft } from "@/hooks/use-booking-draft";
import type { Database } from "@/types/database.types";

type Hotel = Database["public"]["Tables"]["hotels"]["Row"];

// A second, lighter path to the same "bookings" table as the full form —
// only the hotel + guest name + dates are structured; everything else is
// one pasted block of text. Duplicate-check and save both go through the
// same shared hook, so the resulting booking behaves identically everywhere
// else in the app (chat, follow, status, Email Studio).
export function QuickBookingForm({ hotels }: { hotels: Hotel[] }) {
  const {
    draft,
    updateDraft,
    duplicates,
    isCheckingDuplicates,
    duplicateChecked,
    checkDuplicates,
    isSaving,
    save,
  } = useBookingDraft(hotels);

  function handleSave() {
    if (!draft.notes.trim()) {
      toast.error("الرجاء لصق نص الحجز أولاً");
      return;
    }
    save(draft.notes, "quick");
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
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label>الفندق</Label>
              <Select
                value={draft.hotelId}
                onValueChange={(v) => v && updateDraft({ hotelId: v })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="اختر الفندق من الدليل" />
                </SelectTrigger>
                <SelectContent>
                  {hotels.map((h) => (
                    <SelectItem key={h.id} value={h.id}>
                      {h.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="quick_guest_name">اسم الضيف</Label>
              <Input
                id="quick_guest_name"
                value={draft.guestName}
                onChange={(e) => updateDraft({ guestName: e.target.value })}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="quick_guest_phone">رقم الهاتف (اختياري)</Label>
              <Input
                id="quick_guest_phone"
                value={draft.guestPhone}
                onChange={(e) => updateDraft({ guestPhone: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="quick_check_in">تاريخ الوصول</Label>
              <Input
                id="quick_check_in"
                type="date"
                value={draft.checkIn}
                onChange={(e) => updateDraft({ checkIn: e.target.value })}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="quick_check_out">تاريخ المغادرة</Label>
              <Input
                id="quick_check_out"
                type="date"
                value={draft.checkOut}
                onChange={(e) => updateDraft({ checkOut: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="quick_pasted_text">الصق نص الحجز هنا</Label>
            <Textarea
              id="quick_pasted_text"
              value={draft.notes}
              onChange={(e) => updateDraft({ notes: e.target.value })}
              placeholder="الصق أي نص من واتساب أو البريد أو أي مصدر آخر..."
              className="min-h-48 resize-y"
              dir="rtl"
            />
          </div>
        </CardContent>
      </Card>

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
