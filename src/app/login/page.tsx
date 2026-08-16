import { CalendarCheck } from "lucide-react";
import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <div className="ambient-canvas relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-background p-6">
      {/* layered depth: a slow, oversized halo behind the card */}
      <div
        aria-hidden
        className="animate-glow-pulse pointer-events-none absolute left-1/2 top-1/2 size-[52rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60 blur-[120px]"
        style={{
          background:
            "radial-gradient(circle, hsl(var(--glow-hue-a) / 0.22), transparent 62%)",
        }}
      />

      <div className="animate-scale-in relative w-full max-w-[400px]">
        <div className="glass-panel-solid rounded-2xl p-8 sm:p-10">
          <div className="flex flex-col items-center text-center">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[0_10px_30px_-12px_rgb(0_0_0_/_0.7)]">
              <CalendarCheck className="size-[22px]" />
            </div>

            <h1 className="mt-6 text-[1.65rem] font-semibold tracking-[-0.03em]">
              منصة الحجوزات والعمليات
            </h1>
            <p className="mt-2 text-[12.5px] tracking-[0.02em] text-muted-foreground">
              Reservation &amp; Operations Platform
            </p>
          </div>

          <div className="my-8 h-px w-full bg-gradient-to-r from-transparent via-[var(--hairline-strong)] to-transparent" />

          <LoginForm next={next ?? "/"} />
        </div>

        <p className="mt-6 text-center text-[11.5px] text-muted-foreground/70">
          الدخول متاح لأعضاء الفريق المصرّح لهم فقط
        </p>
      </div>
    </div>
  );
}
