import { CheckCircle2, XCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
    <div className="flex items-center justify-between border-b border-border/60 py-3 last:border-0">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
      <Badge
        variant="outline"
        className={
          configured
            ? "border-chart-3/30 bg-chart-3/15 text-chart-3"
            : "border-destructive/30 bg-destructive/10 text-destructive"
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
      label: "Claude (Anthropic)",
      configured: Boolean(process.env.ANTHROPIC_API_KEY),
      hint: "تحليل النصوص العربية، التدقيق اللغوي",
    },
    {
      label: "Resend",
      configured: Boolean(process.env.RESEND_API_KEY),
      hint: "إرسال رسائل البريد الإلكتروني",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">الإعدادات</h1>
        <p className="text-sm text-muted-foreground">
          معلومات الحساب وحالة التكاملات الخارجية
        </p>
      </div>

      <Card className="glass-panel max-w-xl">
        <CardHeader>
          <CardTitle>الحساب</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1 text-sm">
          <p>
            <span className="text-muted-foreground">الاسم: </span>
            {user?.profile?.full_name || "—"}
          </p>
          <p>
            <span className="text-muted-foreground">البريد الإلكتروني: </span>
            {user?.email}
          </p>
          <p>
            <span className="text-muted-foreground">الصلاحية: </span>
            {user?.profile?.role === "admin" ? "مسؤول" : "عضو فريق"}
          </p>
        </CardContent>
      </Card>

      <Card className="glass-panel max-w-xl">
        <CardHeader>
          <CardTitle>التكاملات (System Parameters)</CardTitle>
          <CardDescription>
            حالة مفاتيح الاتصال بالخدمات الخارجية المطلوبة لتشغيل النظام
          </CardDescription>
        </CardHeader>
        <CardContent>
          {integrations.map((integration) => (
            <IntegrationRow key={integration.label} {...integration} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
