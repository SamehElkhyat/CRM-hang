import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BookingStatusBadge } from "./booking-status-badge";
import type { DuplicateCandidate } from "@/types/database.types";

export function DuplicateWarningCard({
  candidates,
}: {
  candidates: DuplicateCandidate[];
}) {
  if (candidates.length === 0) return null;

  return (
    <Alert variant="destructive" className="bg-destructive/5">
      <AlertTriangle />
      <AlertTitle>تنبيه: حجوزات مشابهة محتملة</AlertTitle>
      <AlertDescription>
        <p className="mb-2">
          تم العثور على {candidates.length} حجز مشابه بنفس الفندق مع تداخل في
          التواريخ. راجع القائمة قبل الحفظ لتفادي التكرار.
        </p>
        <div className="flex flex-col gap-2">
          {candidates.map((c) => (
            <Link
              key={c.booking_id}
              href={`/bookings/${c.booking_id}`}
              target="_blank"
              className="flex items-center justify-between rounded-lg border border-destructive/30 bg-background px-3 py-2 text-sm text-foreground transition-colors hover:bg-destructive/10"
            >
              <div>
                <p className="font-medium">{c.guest_name}</p>
                <p className="text-xs text-muted-foreground">
                  {c.check_in} → {c.check_out} · نسبة التطابق{" "}
                  {Math.round(c.similarity_score * 100)}%
                </p>
              </div>
              <BookingStatusBadge status={c.status} />
            </Link>
          ))}
        </div>
      </AlertDescription>
    </Alert>
  );
}
