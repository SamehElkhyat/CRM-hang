import Link from "next/link";
import { CalendarCheck } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { BookingStatusBadge } from "@/components/bookings/booking-status-badge";
import { createClient } from "@/lib/supabase/server";

export default async function BookingsPage() {
  const supabase = await createClient();
  const { data: bookings, error } = await supabase
    .from("bookings")
    .select("id, guest_name, check_in, check_out, status, total_cost, hotels(name)")
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">الحجوزات</h1>
        <p className="text-sm text-muted-foreground">جميع الحجوزات المسجلة في النظام</p>
      </div>

      {error && <p className="text-sm text-destructive">تعذر تحميل الحجوزات: {error.message}</p>}

      {bookings && bookings.length === 0 && (
        <Card className="glass-panel">
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
            <CalendarCheck className="size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              لا توجد حجوزات بعد.{" "}
              <Link href="/parse" className="text-primary underline">
                ابدأ بتحليل حجز جديد
              </Link>
            </p>
          </CardContent>
        </Card>
      )}

      {bookings && bookings.length > 0 && (
        <Card className="glass-panel overflow-hidden p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الضيف</TableHead>
                <TableHead>الفندق</TableHead>
                <TableHead>الوصول</TableHead>
                <TableHead>المغادرة</TableHead>
                <TableHead>التكلفة</TableHead>
                <TableHead>الحالة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking.id} className="cursor-pointer">
                  <TableCell className="p-0">
                    <Link href={`/bookings/${booking.id}`} className="block px-4 py-3">
                      {booking.guest_name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {(booking.hotels as unknown as { name: string } | null)?.name ?? "—"}
                  </TableCell>
                  <TableCell>{booking.check_in}</TableCell>
                  <TableCell>{booking.check_out}</TableCell>
                  <TableCell>{booking.total_cost.toLocaleString()}</TableCell>
                  <TableCell>
                    <BookingStatusBadge status={booking.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
