import { CalendarCheck } from "lucide-react";
import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-6">

      <main className="w-full max-w-[400px]">
        <div className="glass-panel p-8">
          <div className="flex flex-col items-center text-center">
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <CalendarCheck className="size-6" aria-hidden />
            </div>

            <h1 className="mt-6 text-2xl font-semibold tracking-[-0.03em]">
              منصة الحجوزات والعمليات
            </h1>
            <p className="mt-2 text-xs text-muted-foreground">
              Reservation &amp; Operations Platform
            </p>
          </div>

          <div className="my-8 h-px w-full bg-[var(--hairline)]" />

          <LoginForm next={next ?? "/"} />
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          الدخول متاح لأعضاء الفريق المصرّح لهم فقط
        </p>
      </main>
    </div>
  );
}
