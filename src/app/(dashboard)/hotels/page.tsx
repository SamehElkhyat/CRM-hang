import Link from "next/link";
import { ArrowUpLeft, Building2, Mail, Phone, Plus } from "lucide-react";
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
        eyebrow="الدليل"
        title="دليل الفنادق"
        description="بيانات التواصل والسياسات الخاصة بكل فندق"
        actions={
          isAdmin && (
            <Button className="glow-primary-hover" render={<Link href="/hotels/new" />}>
              <Plus />
              إضافة فندق
            </Button>
          )
        }
      />

      {error && (
        <p className="rounded-xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-[13px] text-destructive">
          تعذر تحميل الفنادق: {error.message}
        </p>
      )}

      {hotels && hotels.length === 0 && (
        <div className="glass-panel flex flex-col items-center gap-3 px-6 py-20 text-center">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-muted/60">
            <Building2 className="size-5 text-muted-foreground" />
          </div>
          <p className="text-[13.5px] text-muted-foreground">لا توجد فنادق مسجلة بعد.</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {hotels?.map((hotel, i) => (
          <Link
            key={hotel.id}
            href={`/hotels/${hotel.id}`}
            className="stat-tile animate-fade-in-up group flex flex-col gap-5 p-5"
            style={{ animationDelay: `${i * 55}ms` }}
          >
            <div className="stat-tile-blob bg-chart-1" aria-hidden />

            <div className="relative z-10 flex items-start justify-between gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-foreground/8 transition-transform duration-500 group-hover:scale-105">
                <Building2 className="size-[18px]" />
              </div>
              <div className="flex items-center gap-2">
                {!hotel.is_active && (
                  <Badge variant="outline" className="text-muted-foreground">
                    غير نشط
                  </Badge>
                )}
                <ArrowUpLeft className="size-4 text-muted-foreground opacity-0 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:opacity-100" />
              </div>
            </div>

            <div className="relative z-10">
              <p className="text-[15px] font-semibold tracking-[-0.015em]">
                {hotel.name}
              </p>

              <div className="mt-3 flex flex-col gap-1.5">
                {hotel.hotline && (
                  <span className="flex items-center gap-2 text-[12px] text-muted-foreground">
                    <Phone className="size-3.5 shrink-0 opacity-60" />
                    <span dir="ltr" className="truncate">
                      {hotel.hotline}
                    </span>
                  </span>
                )}
                {hotel.reservation_email && (
                  <span className="flex items-center gap-2 text-[12px] text-muted-foreground">
                    <Mail className="size-3.5 shrink-0 opacity-60" />
                    <span dir="ltr" className="truncate">
                      {hotel.reservation_email}
                    </span>
                  </span>
                )}
                {hotel.sales_email && (
                  <span className="flex items-center gap-2 text-[12px] text-muted-foreground">
                    <Mail className="size-3.5 shrink-0 opacity-60" />
                    <span dir="ltr" className="truncate">
                      {hotel.sales_email}
                    </span>
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
