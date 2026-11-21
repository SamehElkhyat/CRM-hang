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
        <Label htmlFor="email" className="text-xs text-muted-foreground">
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
        <Label htmlFor="password" className="text-xs text-muted-foreground">
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
          className="rounded-lg border border-destructive/25 bg-destructive/10 px-3.5 py-2.5 text-xs leading-relaxed text-destructive"
          role="alert"
        >
          {state.error}
        </p>
      )}

      <Button
        type="submit"
        disabled={isPending}
        size="lg"
        className="mt-1 self-start px-6"
      >
        {isPending ? (
          <>
            <Loader2 className="animate-spin" />
            جاري الدخول...
          </>
        ) : (
          <>
            تسجيل الدخول
            <ArrowLeft aria-hidden />
          </>
        )}
      </Button>
    </form>
  );
}
