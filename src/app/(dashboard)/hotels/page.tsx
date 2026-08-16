import Link from "next/link";
import { Building2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCurrentUser } from "@/lib/auth/get-current-profile";
import { createClient } from "@/lib/supabase/server";

export default async function HotelsPage() {
  const [user, supabase] = await Promise.all([getCurrentUser(), createClient()]);
  const isAdmin = user?.profile?.role === "admin";

  const { data: hotels, error } = await supabase
    .from("hotels")
    .select("id, name, hotline, reservation_email, sales_email, is_active")
    .order("name");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">دليل الفنادق</h1>
          <p className="text-sm text-muted-foreground">
            بيانات التواصل والسياسات الخاصة بكل فندق
          </p>
        </div>
        {isAdmin && (
          <Button className="glow-primary-hover" render={<Link href="/hotels/new" />}>
            <Plus />
            إضافة فندق
          </Button>
        )}
      </div>

      {error && (
        <p className="text-sm text-destructive">تعذر تحميل الفنادق: {error.message}</p>
      )}

      {hotels && hotels.length === 0 && (
        <Card className="glass-panel">
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
            <Building2 className="size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              لا توجد فنادق مسجلة بعد.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {hotels?.map((hotel) => (
          <Link key={hotel.id} href={`/hotels/${hotel.id}`}>
            <Card className="glass-panel h-full transition-colors hover:bg-accent/40">
              <CardContent className="flex flex-col gap-2 px-5 py-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold">{hotel.name}</p>
                  {!hotel.is_active && (
                    <Badge variant="outline" className="text-muted-foreground">
                      غير نشط
                    </Badge>
                  )}
                </div>
                <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
                  {hotel.hotline && <p>هاتف: {hotel.hotline}</p>}
                  {hotel.reservation_email && <p>حجوزات: {hotel.reservation_email}</p>}
                  {hotel.sales_email && <p>مبيعات: {hotel.sales_email}</p>}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
