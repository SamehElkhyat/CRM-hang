import Link from "next/link";
import { Building2, Mail, Phone, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
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
    <div className="flex flex-col gap-8">
      <PageHeader
        title="دليل الفنادق"
        description="بيانات التواصل والسياسات الخاصة بكل فندق"
        actions={
          isAdmin && (
            <Button render={<Link href="/hotels/new" />}>
              <Plus />
              إضافة فندق
            </Button>
          )
        }
      />

      {error && (
        <p className="rounded-xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          تعذر تحميل الفنادق: {error.message}
        </p>
      )}

      {hotels && hotels.length === 0 && (
        <div className="glass-panel flex flex-col items-center gap-3 px-6 py-20 text-center">
          <Building2 className="size-6 text-muted-foreground" aria-hidden />
          <p className="text-sm text-muted-foreground">لا توجد فنادق مسجلة بعد.</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {hotels?.map((hotel) => (
          <Link
            key={hotel.id}
            href={`/hotels/${hotel.id}`}
            className="glass-panel panel-link flex flex-col gap-4 p-5 focus-visible:outline-2 focus-visible:outline-ring"
          >
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-base font-semibold tracking-[-0.015em]">{hotel.name}</h2>
              {!hotel.is_active && (
                <Badge variant="outline" className="text-muted-foreground">
                  غير نشط
                </Badge>
              )}
            </div>

            <div className="flex flex-col gap-2">
                {hotel.hotline && (
                  <span className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="size-4 shrink-0" aria-hidden />
                    <span dir="ltr" className="truncate">
                      {hotel.hotline}
                    </span>
                  </span>
                )}
                {hotel.reservation_email && (
                  <span className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="size-4 shrink-0" aria-hidden />
                    <span dir="ltr" className="truncate">
                      {hotel.reservation_email}
                    </span>
                  </span>
                )}
                {hotel.sales_email && (
                  <span className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="size-4 shrink-0" aria-hidden />
                    <span dir="ltr" className="truncate">
                      {hotel.sales_email}
                    </span>
                  </span>
                )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
