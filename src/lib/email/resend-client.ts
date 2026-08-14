import { Resend } from "resend";

let client: Resend | null = null;

export function getResendClient(): Resend {
  if (!process.env.RESEND_API_KEY) {
    throw new Error(
      "RESEND_API_KEY غير مُهيأ. أضفه في ملف .env.local لتفعيل إرسال البريد.",
    );
  }
  if (!client) {
    client = new Resend(process.env.RESEND_API_KEY);
  }
  return client;
}
