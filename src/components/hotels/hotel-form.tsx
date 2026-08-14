"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { RoomTypeEditor } from "./room-type-editor";
import { ChildPolicyEditor } from "./child-policy-editor";
import { saveHotel, type HotelFormState } from "@/app/(dashboard)/hotels/actions";
import type { Database } from "@/types/database.types";

type Hotel = Database["public"]["Tables"]["hotels"]["Row"];

const initialState: HotelFormState = { error: null };

export function HotelForm({ hotel }: { hotel?: Hotel }) {
  const [state, formAction, isPending] = useActionState(saveHotel, initialState);
  const [roomTypes, setRoomTypes] = useState(hotel?.room_types ?? []);
  const [childPolicy, setChildPolicy] = useState(hotel?.child_policy ?? {});

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {hotel && <input type="hidden" name="hotel_id" value={hotel.id} />}
      <input type="hidden" name="room_types_json" value={JSON.stringify(roomTypes)} />
      <input
        type="hidden"
        name="child_policy_json"
        value={JSON.stringify(childPolicy)}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="name">اسم الفندق</Label>
          <Input id="name" name="name" defaultValue={hotel?.name} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="hotline">الخط الساخن</Label>
          <Input id="hotline" name="hotline" defaultValue={hotel?.hotline ?? ""} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="reservation_email">بريد الحجوزات</Label>
          <Input
            id="reservation_email"
            name="reservation_email"
            type="email"
            defaultValue={hotel?.reservation_email ?? ""}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="sales_email">بريد المبيعات</Label>
          <Input
            id="sales_email"
            name="sales_email"
            type="email"
            defaultValue={hotel?.sales_email ?? ""}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="finance_email">بريد الحسابات</Label>
          <Input
            id="finance_email"
            name="finance_email"
            type="email"
            defaultValue={hotel?.finance_email ?? ""}
          />
        </div>
      </div>

      <Separator />
      <RoomTypeEditor value={roomTypes} onChange={setRoomTypes} />

      <Separator />
      <ChildPolicyEditor value={childPolicy} onChange={setChildPolicy} />

      {state.error && (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={isPending} className="self-start">
        {isPending ? "جاري الحفظ..." : hotel ? "حفظ التعديلات" : "إضافة الفندق"}
      </Button>
    </form>
  );
}
