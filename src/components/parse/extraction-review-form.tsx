"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Database } from "@/types/database.types";

type Hotel = Database["public"]["Tables"]["hotels"]["Row"];

export interface BookingDraft {
  hotelId: string;
  guestName: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  roomCategory: string;
  mealPlan: string;
  rate: string;
  currency: string;
  childrenAgesText: string;
  notes: string;
}

export function ExtractionReviewForm({
  hotels,
  draft,
  onChange,
}: {
  hotels: Hotel[];
  draft: BookingDraft;
  onChange: (patch: Partial<BookingDraft>) => void;
}) {
  const selectedHotel = hotels.find((h) => h.id === draft.hotelId);

  return (
    <Card className="glass-panel">
      <CardHeader>
        <CardTitle>مراجعة البيانات المستخرجة</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label>الفندق</Label>
            <Select
              value={draft.hotelId}
              onValueChange={(v) => v && onChange({ hotelId: v, roomCategory: "", rate: "" })}
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

          {selectedHotel && (selectedHotel.room_types as { name: string; base_rate: number }[]).length > 0 && (
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label className="text-xs text-muted-foreground">
                فئات الغرف المتاحة (اضغط لاختيار الفئة والسعر)
              </Label>
              <div className="flex flex-wrap gap-2">
                {(selectedHotel.room_types as { name: string; base_rate: number }[]).map(
                  (rt) => (
                    <Badge
                      key={rt.name}
                      variant={draft.roomCategory === rt.name ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() =>
                        onChange({ roomCategory: rt.name, rate: String(rt.base_rate) })
                      }
                    >
                      {rt.name} — {rt.base_rate}
                    </Badge>
                  ),
                )}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="guest_name">اسم الضيف</Label>
            <Input
              id="guest_name"
              value={draft.guestName}
              onChange={(e) => onChange({ guestName: e.target.value })}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="guest_phone">رقم الهاتف</Label>
            <Input
              id="guest_phone"
              value={draft.guestPhone}
              onChange={(e) => onChange({ guestPhone: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="check_in">تاريخ الوصول</Label>
            <Input
              id="check_in"
              type="date"
              value={draft.checkIn}
              onChange={(e) => onChange({ checkIn: e.target.value })}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="check_out">تاريخ المغادرة</Label>
            <Input
              id="check_out"
              type="date"
              value={draft.checkOut}
              onChange={(e) => onChange({ checkOut: e.target.value })}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="room_category">فئة الغرفة</Label>
            <Input
              id="room_category"
              value={draft.roomCategory}
              onChange={(e) => onChange({ roomCategory: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="meal_plan">نظام الإعاشة</Label>
            <Input
              id="meal_plan"
              value={draft.mealPlan}
              onChange={(e) => onChange({ mealPlan: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="rate">السعر لليلة</Label>
            <Input
              id="rate"
              type="number"
              min={0}
              step="0.01"
              value={draft.rate}
              onChange={(e) => onChange({ rate: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="currency">العملة</Label>
            <Input
              id="currency"
              value={draft.currency}
              onChange={(e) => onChange({ currency: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="children_ages">أعمار الأطفال (مفصولة بفاصلة)</Label>
            <Input
              id="children_ages"
              placeholder="مثال: 4, 9"
              value={draft.childrenAgesText}
              onChange={(e) => onChange({ childrenAgesText: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="notes">ملاحظات</Label>
            <Textarea
              id="notes"
              value={draft.notes}
              onChange={(e) => onChange({ notes: e.target.value })}
              className="min-h-20"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
