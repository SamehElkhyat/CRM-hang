import Link from "next/link";
import { CalendarCheck, Plus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookingStatusBadge } from "@/components/bookings/booking-status-badge";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/get-current-profile";

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter: rawFilter } = await searchParams;
  const filter = rawFilter === "following" ? "following" : "all";

  const [supabase, currentUser] = await Promise.all([createClient(), getCurrentUser()]);

  let query = supabase
    .from("bookings")
    .select("id, guest_name, check_in, check_out, status, total_cost, hotels(name)")
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(100);

  if (filter === "following" && currentUser) {
    const { data: follows } = await supabase
      .from("booking_followers")
      .select("booking_id")
      .eq("user_id", currentUser.id);
    const followedIds = (follows ?? []).map((f) => f.booking_id);

    query =
      followedIds.length > 0
        ? query.or(`created_by.eq.${currentUser.id},id.in.(${followedIds.join(",")})`)
        : query.eq("created_by", currentUser.id);
  }

  const { data: bookings, error } = await query;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">الحجوزات</h1>
          <p className="text-sm text-muted-foreground">جميع الحجوزات المسجلة في النظام</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant={filter === "all" ? "default" : "outline"} size="sm" render={<Link href="/bookings" />}>
            الكل
          </Button>
          <Button
            variant={filter === "following" ? "default" : "outline"}
            size="sm"
            render={<Link href="/bookings?filter=following" />}
          >
            متابعاتي
          </Button>
          <Button size="sm" render={<Link href="/bookings/new" />}>
            <Plus />
            إضافة حجز
          </Button>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">تعذر تحميل الحجوزات: {error.message}</p>}

      {bookings && bookings.length === 0 && (
        <Card className="glass-panel">
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
            <CalendarCheck className="size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {filter === "following" ? (
                "لا توجد حجوزات ضمن متابعاتك بعد."
              ) : (
                <>
                  لا توجد حجوزات بعد.{" "}
                  <Link href="/parse" className="text-primary underline">
                    ابدأ بتحليل حجز جديد
                  </Link>
                </>
              )}
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
