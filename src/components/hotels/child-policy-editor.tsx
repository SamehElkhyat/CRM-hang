"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ChildPolicy } from "@/types/database.types";

export function ChildPolicyEditor({
  value,
  onChange,
}: {
  value: ChildPolicy;
  onChange: (next: ChildPolicy) => void;
}) {
  function set(patch: Partial<ChildPolicy>) {
    onChange({ ...value, ...patch });
  }

  function setExtraBed(patch: Partial<NonNullable<ChildPolicy["extra_bed"]>>) {
    onChange({
      ...value,
      extra_bed: {
        min_age: value.extra_bed?.min_age ?? 0,
        max_age: value.extra_bed?.max_age ?? 0,
        charge: value.extra_bed?.charge ?? 0,
        ...patch,
      },
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <Label>سياسة الأطفال</Label>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="currency" className="text-xs text-muted-foreground">
            العملة
          </Label>
          <Input
            id="currency"
            placeholder="EGP"
            value={value.currency ?? ""}
            onChange={(e) => set({ currency: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="free_age" className="text-xs text-muted-foreground">
            سن الإقامة المجانية حتى
          </Label>
          <Input
            id="free_age"
            type="number"
            min={0}
            value={value.free_age_limit ?? 0}
            onChange={(e) => set({ free_age_limit: Number(e.target.value) || 0 })}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="extra_min" className="text-xs text-muted-foreground">
            سرير إضافي: من سن
          </Label>
          <Input
            id="extra_min"
            type="number"
            min={0}
            value={value.extra_bed?.min_age ?? 0}
            onChange={(e) => setExtraBed({ min_age: Number(e.target.value) || 0 })}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="extra_max" className="text-xs text-muted-foreground">
            سرير إضافي: حتى سن
          </Label>
          <Input
            id="extra_max"
            type="number"
            min={0}
            value={value.extra_bed?.max_age ?? 0}
            onChange={(e) => setExtraBed({ max_age: Number(e.target.value) || 0 })}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="extra_charge" className="text-xs text-muted-foreground">
            رسوم السرير الإضافي (طفل)
          </Label>
          <Input
            id="extra_charge"
            type="number"
            min={0}
            step="0.01"
            value={value.extra_bed?.charge ?? 0}
            onChange={(e) => setExtraBed({ charge: Number(e.target.value) || 0 })}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="adult_charge" className="text-xs text-muted-foreground">
            رسوم السرير الإضافي (بالغ)
          </Label>
          <Input
            id="adult_charge"
            type="number"
            min={0}
            step="0.01"
            value={value.adult_extra_bed_charge ?? 0}
            onChange={(e) =>
              set({ adult_extra_bed_charge: Number(e.target.value) || 0 })
            }
          />
        </div>
      </div>
    </div>
  );
}
