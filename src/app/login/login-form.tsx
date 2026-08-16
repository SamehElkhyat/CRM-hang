"use client";

import { useActionState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn, type LoginState } from "./actions";

const initialState: LoginState = { error: null };

export function LoginForm({ next }: { next: string }) {
  const [state, formAction, isPending] = useActionState(signIn, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="next" value={next} />

      <div className="flex flex-col gap-2">
        <Label htmlFor="email" className="text-[12.5px] text-muted-foreground">
          البريد الإلكتروني
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="name@company.com"
          dir="ltr"
          className="text-start"
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="password" className="text-[12.5px] text-muted-foreground">
          كلمة المرور
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          dir="ltr"
          className="text-start"
          required
        />
      </div>

      {state.error && (
        <p
          className="animate-fade-in rounded-lg border border-destructive/25 bg-destructive/10 px-3.5 py-2.5 text-[12.5px] leading-relaxed text-destructive"
          role="alert"
        >
          {state.error}
        </p>
      )}

      <Button
        type="submit"
        disabled={isPending}
        size="lg"
        className="glow-primary-hover mt-1 w-full"
      >
        {isPending ? (
          <>
            <Loader2 className="animate-spin" />
            جاري الدخول...
          </>
        ) : (
          <>
            تسجيل الدخول
            <ArrowLeft className="transition-transform duration-300 group-hover/button:-translate-x-0.5" />
          </>
        )}
      </Button>
    </form>
  );
}
