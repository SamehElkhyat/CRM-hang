import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HotelForm } from "@/components/hotels/hotel-form";
import { getCurrentUser } from "@/lib/auth/get-current-profile";
import { createClient } from "@/lib/supabase/server";
import { setHotelActive } from "../actions";
import type { RoomType } from "@/types/database.types";

export default async function HotelDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [user, supabase] = await Promise.all([getCurrentUser(), createClient()]);
  const isAdmin = user?.profile?.role === "admin";

  const { data: hotel } = await supabase
    .from("hotels")
    .select("*")
    .eq("id", id)
    .single();

  if (!hotel) notFound();

  if (isAdmin) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{hotel.name}</h1>
            <p className="text-sm text-muted-foreground">تعديل بيانات الفندق</p>
          </div>
          <form
            action={async () => {
              "use server";
              await setHotelActive(hotel.id, !hotel.is_active);
            }}
          >
            <Button type="submit" variant="outline" size="sm">
              {hotel.is_active ? "تعطيل الفندق" : "تفعيل الفندق"}
            </Button>
          </form>
        </div>
        <Card className="glass-panel max-w-3xl">
          <CardHeader>
            <CardTitle>بيانات الفندق</CardTitle>
          </CardHeader>
          <CardContent>
            <HotelForm hotel={hotel} />
          </CardContent>
        </Card>
      </div>
    );
  }

  const roomTypes = (hotel.room_types ?? []) as RoomType[];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold">{hotel.name}</h1>
        {!hotel.is_active && <Badge variant="outline">غير نشط</Badge>}
      </div>

      <Card className="glass-panel max-w-2xl">
        <CardHeader>
          <CardTitle>بيانات التواصل</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1 text-sm">
          <p>
            <span className="text-muted-foreground">الخط الساخن: </span>
            {hotel.hotline || "—"}
          </p>
          <p>
            <span className="text-muted-foreground">بريد الحجوزات: </span>
            {hotel.reservation_email || "—"}
          </p>
          <p>
            <span className="text-muted-foreground">بريد المبيعات: </span>
            {hotel.sales_email || "—"}
          </p>
          <p>
            <span className="text-muted-foreground">بريد الحسابات: </span>
            {hotel.finance_email || "—"}
          </p>
        </CardContent>
      </Card>

      <Card className="glass-panel max-w-2xl">
        <CardHeader>
          <CardTitle>فئات الغرف</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm">
          {roomTypes.length === 0 && (
            <p className="text-muted-foreground">لا توجد فئات مسجلة.</p>
          )}
          {roomTypes.map((rt, i) => (
            <div key={i} className="flex items-center justify-between">
              <span>{rt.name}</span>
              <span className="text-muted-foreground">{rt.base_rate}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
