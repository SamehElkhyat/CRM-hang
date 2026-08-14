"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { RoomType } from "@/types/database.types";

export function RoomTypeEditor({
  value,
  onChange,
}: {
  value: RoomType[];
  onChange: (next: RoomType[]) => void;
}) {
  function update(index: number, patch: Partial<RoomType>) {
    onChange(value.map((rt, i) => (i === index ? { ...rt, ...patch } : rt)));
  }

  function remove(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function add() {
    onChange([...value, { name: "", base_rate: 0 }]);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <Label>فئات الغرف والأسعار الأساسية</Label>
        <Button type="button" variant="outline" size="sm" onClick={add}>
          <Plus />
          إضافة فئة
        </Button>
      </div>
      {value.length === 0 && (
        <p className="text-sm text-muted-foreground">لا توجد فئات غرف بعد.</p>
      )}
      <div className="flex flex-col gap-2">
        {value.map((rt, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input
              placeholder="اسم الفئة (مثال: Deluxe Room)"
              value={rt.name}
              onChange={(e) => update(index, { name: e.target.value })}
              className="flex-1"
            />
            <Input
              type="number"
              min={0}
              step="0.01"
              placeholder="السعر الأساسي لليلة"
              value={rt.base_rate}
              onChange={(e) =>
                update(index, { base_rate: Number(e.target.value) || 0 })
              }
              className="w-40"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => remove(index)}
              aria-label="حذف الفئة"
            >
              <Trash2 className="size-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
