import { getResendClient } from "./resend-client";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function bodyToHtml(body: string): string {
  const escaped = escapeHtml(body).replace(/\n/g, "<br />");
  return `<div dir="auto" style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.7; white-space: pre-wrap;">${escaped}</div>`;
}

export async function sendBookingEmail(params: {
  to: string;
  cc?: string[];
  subject: string;
  body: string;
}): Promise<string | null> {
  const from = process.env.RESEND_FROM_EMAIL;
  if (!from) {
    throw new Error("RESEND_FROM_EMAIL غير مُهيأ. أضفه في ملف .env.local.");
  }

  const resend = getResendClient();
  const { data, error } = await resend.emails.send({
    from,
    to: params.to,
    cc: params.cc,
    subject: params.subject,
    html: bodyToHtml(params.body),
  });

  if (error) {
    throw new Error(error.message);
  }

  return data?.id ?? null;
}
