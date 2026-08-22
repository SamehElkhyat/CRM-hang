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
        <p className="text-[14px] font-medium tracking-[-0.01em]">{label}</p>
        <p className="mt-0.5 text-[12px] text-muted-foreground">{hint}</p>
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
        eyebrow="الحساب"
        title="الإعدادات"
        description="معلومات الحساب وحالة التكاملات الخارجية"
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div
          className="glass-panel animate-fade-in-up flex flex-col justify-between gap-8 p-6 lg:col-span-5"
          style={{ animationDelay: "60ms" }}
        >
          <div className="flex items-center justify-between">
            <p className="eyebrow">الملف الشخصي</p>
            <span
              className={
                isAdmin
                  ? "flex items-center gap-1.5 rounded-full border border-chart-1/25 bg-chart-1/10 px-2.5 py-1 text-[11px] font-medium text-chart-1"
                  : "flex items-center gap-1.5 rounded-full border border-[var(--hairline)] bg-muted/50 px-2.5 py-1 text-[11px] font-medium text-muted-foreground"
              }
            >
              <ShieldCheck className="size-3" />
              {isAdmin ? "مسؤول" : "عضو فريق"}
            </span>
          </div>

          <div>
            <p className="text-[1.5rem] font-semibold tracking-[-0.025em]">
              {user?.profile?.full_name || "—"}
            </p>
            <p dir="ltr" className="mt-1 text-start text-[13px] text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </div>

        <div
          className="glass-panel animate-fade-in-up overflow-hidden lg:col-span-7"
          style={{ animationDelay: "130ms" }}
        >
          <div className="border-b border-[var(--hairline)] px-6 py-4">
            <p className="eyebrow">التكاملات · System Parameters</p>
            <p className="mt-1.5 text-[12.5px] text-muted-foreground">
              حالة مفاتيح الاتصال بالخدمات الخارجية المطلوبة لتشغيل النظام
            </p>
          </div>
          {integrations.map((integration) => (
            <IntegrationRow key={integration.label} {...integration} />
          ))}
        </div>
      </div>
    </div>
  );
}
