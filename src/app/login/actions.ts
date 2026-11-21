"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface LoginState {
  error: string | null;
}

export async function signIn(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/");

  if (!email || !password) {
    return { error: "الرجاء إدخال البريد الإلكتروني وكلمة المرور" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    console.error("[auth] signInWithPassword failed:", error.status, error.code, error.message);

    const message = error.message?.toLowerCase() ?? "";
    if (error.code === "email_not_confirmed" || message.includes("email not confirmed")) {
      return {
        error:
          "لم يتم تأكيد البريد الإلكتروني بعد. فعّل \"Auto Confirm\" عند إنشاء المستخدم من لوحة Supabase، أو أكّد البريد يدوياً.",
      };
    }
    if (error.code === "invalid_credentials" || message.includes("invalid login credentials")) {
      return {
        error:
          "بيانات الدخول غير صحيحة، أو أن هذا المستخدم غير موجود في Supabase Auth. تحقق من Authentication → Users في لوحة Supabase.",
      };
    }
    return { error: `فشل تسجيل الدخول: ${error.message}` };
  }

  // Admins land on the Team cards board by default. An explicit `next`
  // (e.g. a deep link that bounced through login) is always honoured,
  // and agents keep landing on the dashboard as before.
  let destination = next || "/";
  if (destination === "/" && data.user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();
    if (profile?.role === "admin") destination = "/team";
  }

  redirect(destination);
}
