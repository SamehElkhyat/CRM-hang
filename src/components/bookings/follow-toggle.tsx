"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Bell, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleFollow } from "@/app/(dashboard)/bookings/actions";

export function FollowToggle({
  bookingId,
  initialFollowing,
}: {
  bookingId: string;
  initialFollowing: boolean;
}) {
  const [following, setFollowing] = useState(initialFollowing);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    const next = !following;
    setFollowing(next);
    startTransition(async () => {
      const result = await toggleFollow(bookingId, next);
      if (result.error) {
        setFollowing(!next);
        toast.error(result.error);
      }
    });
  }

  return (
    <Button
      variant={following ? "secondary" : "outline"}
      size="sm"
      onClick={handleClick}
      disabled={isPending}
    >
      {following ? <BellOff className="size-3.5" /> : <Bell className="size-3.5" />}
      {following ? "إلغاء المتابعة" : "متابعة"}
    </Button>
  );
}
