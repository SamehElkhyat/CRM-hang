"use client";

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
import { cn } from "@/lib/utils";
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

function Step({
  number,
  title,
  hint,
  children,
}: {
  number: number;
  title: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <section className="glass-panel p-5">
      <div className="mb-4 flex items-baseline gap-3">
        <span className="text-base font-semibold tabular-nums text-primary">{number}</span>
        <div>
          <h2 className="text-base font-semibold">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{hint}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function Field({
  id,
  label,
  required,
  wide,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-2", wide && "sm:col-span-2")}>
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
    </div>
  );
}

export function BookingFormFields({
  hotels,
  draft,
  onChange,
}: {
  hotels: Hotel[];
  draft: BookingDraft;
  onChange: (patch: Partial<BookingDraft>) => void;
}) {
  const selectedHotel = hotels.find((h) => h.id === draft.hotelId);
  const roomTypes = (selectedHotel?.room_types ?? []) as { name: string; base_rate: number }[];
  const datesReversed =
    Boolean(draft.checkIn && draft.checkOut) && draft.checkOut <= draft.checkIn;

  return (
    <div className="flex flex-col gap-4">
      <Step number={1} title="الفندق والضيف" hint="مين هينزل، وفين.">
        <Field id="hotel" label="الفندق" required wide>
          <Select
            items={hotels.map((h) => ({ value: h.id, label: h.name }))}
            value={draft.hotelId}
            onValueChange={(v) => v && onChange({ hotelId: v, roomCategory: "", rate: "" })}
          >
            <SelectTrigger id="hotel" className="w-full">
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
        </Field>
        <Field id="guest_name" label="اسم الضيف" required>
          <Input
            id="guest_name"
            value={draft.guestName}
            onChange={(e) => onChange({ guestName: e.target.value })}
            required
          />
        </Field>
        <Field id="guest_phone" label="رقم الهاتف">
          <Input
            id="guest_phone"
            type="tel"
            value={draft.guestPhone}
            onChange={(e) => onChange({ guestPhone: e.target.value })}
          />
        </Field>
      </Step>

      <Step number={2} title="مدة الإقامة" hint="يوم الوصول ويوم المغادرة.">
        <Field id="check_in" label="تاريخ الوصول" required>
          <Input
            id="check_in"
            type="date"
            value={draft.checkIn}
            onChange={(e) => onChange({ checkIn: e.target.value })}
            required
          />
        </Field>
        <Field id="check_out" label="تاريخ المغادرة" required>
          <Input
            id="check_out"
            type="date"
            min={draft.checkIn || undefined}
            value={draft.checkOut}
            onChange={(e) => onChange({ checkOut: e.target.value })}
            aria-invalid={datesReversed || undefined}
            required
          />
        </Field>
        {datesReversed && (
          <p role="alert" className="text-sm text-destructive sm:col-span-2">
            تاريخ المغادرة لازم يكون بعد تاريخ الوصول.
          </p>
        )}
      </Step>

      <Step number={3} title="الغرفة والسعر" hint="اختياري. ممكن تحفظ من غيرها.">
        {roomTypes.length > 0 && (
          <div className="flex flex-col gap-2 sm:col-span-2">
            <p className="text-sm text-muted-foreground">
              اضغط على الفئة لتعبئة اسمها وسعرها تلقائياً
            </p>
            <div className="flex flex-wrap gap-2">
              {roomTypes.map((rt) => {
                const isSelected = draft.roomCategory === rt.name;
                return (
                  <button
                    key={rt.name}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() =>
                      onChange({ roomCategory: rt.name, rate: String(rt.base_rate) })
                    }
                    className={cn(
                      "rounded-lg border px-3 py-2 text-sm font-medium transition-colors duration-150 ease-out focus-visible:outline-2 focus-visible:outline-ring",
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-[var(--hairline-strong)] hover:bg-accent",
                    )}
                  >
                    {rt.name}: <span className="tabular-nums">{rt.base_rate}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
        <Field id="room_category" label="فئة الغرفة">
          <Input
            id="room_category"
            value={draft.roomCategory}
            onChange={(e) => onChange({ roomCategory: e.target.value })}
          />
        </Field>
        <Field id="meal_plan" label="نظام الإعاشة">
          <Input
            id="meal_plan"
            placeholder="مثال: إفطار فقط، نصف إقامة"
            value={draft.mealPlan}
            onChange={(e) => onChange({ mealPlan: e.target.value })}
          />
        </Field>
        <Field id="rate" label="السعر لليلة">
          <Input
            id="rate"
            type="number"
            min={0}
            step="0.01"
            value={draft.rate}
            onChange={(e) => onChange({ rate: e.target.value })}
          />
        </Field>
        <Field id="currency" label="العملة">
          <Input
            id="currency"
            value={draft.currency}
            onChange={(e) => onChange({ currency: e.target.value })}
          />
        </Field>
        <Field id="children_ages" label="أعمار الأطفال (مفصولة بفاصلة)" wide>
          <Input
            id="children_ages"
            placeholder="مثال: 4, 9"
            value={draft.childrenAgesText}
            onChange={(e) => onChange({ childrenAgesText: e.target.value })}
          />
        </Field>
        <Field id="notes" label="ملاحظات" wide>
          <Textarea
            id="notes"
            value={draft.notes}
            onChange={(e) => onChange({ notes: e.target.value })}
            className="min-h-20"
          />
        </Field>
      </Step>
    </div>
  );
}
