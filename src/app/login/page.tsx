import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/20 p-6">
      <div className="glass-panel-solid animate-scale-in w-full max-w-sm rounded-2xl p-8">
        <div className="mb-6 text-center">
          <h1 className="gradient-text text-xl font-bold">منصة الحجوزات والعمليات</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Reservation &amp; Operations Platform
          </p>
        </div>
        <LoginForm next={next ?? "/"} />
      </div>
    </div>
  );
}
