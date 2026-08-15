"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateBookingStatus } from "@/app/(dashboard)/bookings/actions";
import { BOOKING_STATUS_LABELS } from "@/lib/booking-status-labels";
import type { BookingStatus } from "@/types/database.types";

const OPTIONS = (Object.entries(BOOKING_STATUS_LABELS) as [BookingStatus, string][]).map(
  ([value, label]) => ({ value, label }),
);

export function BookingStatusSelect({
  bookingId,
  status,
}: {
  bookingId: string;
  status: BookingStatus;
}) {
  const [value, setValue] = useState(status);
  const [isPending, startTransition] = useTransition();

  function handleChange(next: string | null) {
    if (!next) return;
    const previous = value;
    setValue(next as BookingStatus);
    startTransition(async () => {
      const result = await updateBookingStatus(bookingId, next as BookingStatus);
      if (result.error) {
        setValue(previous);
        toast.error(result.error);
      }
    });
  }

  return (
    <Select value={value} onValueChange={handleChange} disabled={isPending}>
      <SelectTrigger className="w-40">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {OPTIONS.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
