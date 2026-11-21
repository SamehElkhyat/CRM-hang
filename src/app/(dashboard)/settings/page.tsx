import { CheckCircle2, ShieldCheck, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import { getCurrentUser } from "@/lib/auth/get-current-profile";

function IntegrationRow({
  label,
  configured,
  hint,
}: {
  label: string;
  configured: boolean;
  hint: string;
}) {
  return (
    <div className="row-interactive flex items-center justify-between gap-4 border-b border-[var(--hairline)] px-6 py-4 last:border-0">
      <div className="min-w-0">
        <p className="text-sm font-medium tracking-[-0.01em]">{label}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
      </div>
      <Badge
        variant="outline"
        className={
          configured
            ? "border-chart-3/25 bg-chart-3/10 text-chart-3"
            : "border-destructive/25 bg-destructive/10 text-destructive"
        }
      >
        {configured ? <CheckCircle2 /> : <XCircle />}
        {configured ? "مُفعّل" : "غير مُهيّأ"}
      </Badge>
    </div>
  );
}

export default async function SettingsPage() {
  const user = await getCurrentUser();
  const isAdmin = user?.profile?.role === "admin";

  const integrations = [
    {
      label: "Supabase",
      configured: Boolean(
        process.env.NEXT_PUBLIC_SUPABASE_URL &&
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      ),
      hint: "قاعدة البيانات، المصادقة",
    },
    {
      label: "Resend",
      configured: Boolean(process.env.RESEND_API_KEY),
      hint: "إرسال رسائل البريد الإلكتروني",
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="الإعدادات"
        description="معلومات الحساب وحالة التكاملات الخارجية"
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <section className="glass-panel flex flex-col justify-between gap-8 p-6 lg:col-span-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">الملف الشخصي</h2>
            <span
              className="flex items-center gap-1 rounded-full border border-[var(--hairline)] px-2 py-1 text-xs font-medium text-muted-foreground"
            >
              {isAdmin && <ShieldCheck className="size-3" aria-hidden />}
              {isAdmin ? "مسؤول" : "عضو فريق"}
            </span>
          </div>

          <div>
            <p className="text-2xl font-semibold tracking-[-0.025em]">
              {user?.profile?.full_name || "بدون اسم"}
            </p>
            <p dir="ltr" className="mt-1 text-start text-sm text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </section>

        <section className="glass-panel overflow-hidden lg:col-span-7">
          <div className="border-b border-[var(--hairline)] px-6 py-4">
            <h2 className="text-sm font-semibold">التكاملات</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              حالة مفاتيح الاتصال بالخدمات الخارجية المطلوبة لتشغيل النظام
            </p>
          </div>
          {integrations.map((integration) => (
            <IntegrationRow key={integration.label} {...integration} />
          ))}
        </section>
      </div>
    </div>
  );
}
