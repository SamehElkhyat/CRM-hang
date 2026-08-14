"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";
import { hotelSchema } from "@/lib/validations/hotel";

export interface HotelFormState {
  error: string | null;
}

function parseFormData(formData: FormData) {
  let roomTypes: unknown = [];
  let childPolicy: unknown = {};
  try {
    roomTypes = JSON.parse(String(formData.get("room_types_json") ?? "[]"));
    childPolicy = JSON.parse(String(formData.get("child_policy_json") ?? "{}"));
  } catch {
    // leave as empty defaults — schema validation below will not fail on
    // these since defaults apply, but a malformed hidden field is a bug,
    // not user input, so we don't need a user-facing message for it.
  }

  return hotelSchema.safeParse({
    name: formData.get("name"),
    hotline: formData.get("hotline") || undefined,
    reservation_email: formData.get("reservation_email") || "",
    sales_email: formData.get("sales_email") || "",
    finance_email: formData.get("finance_email") || "",
    room_types: roomTypes,
    child_policy: childPolicy,
  });
}

export async function saveHotel(
  _prevState: HotelFormState,
  formData: FormData,
): Promise<HotelFormState> {
  const admin = await requireAdmin();
  if (!admin.ok) {
    return { error: "غير مصرح لك بتعديل بيانات الفنادق" };
  }

  const parsed = parseFormData(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "بيانات غير صحيحة" };
  }

  const hotelId = String(formData.get("hotel_id") ?? "").trim();
  const supabase = await createClient();

  const payload = {
    name: parsed.data.name,
    hotline: parsed.data.hotline || null,
    reservation_email: parsed.data.reservation_email || null,
    sales_email: parsed.data.sales_email || null,
    finance_email: parsed.data.finance_email || null,
    room_types: parsed.data.room_types,
    child_policy: parsed.data.child_policy,
  };

  if (hotelId) {
    const { error } = await supabase
      .from("hotels")
      .update(payload)
      .eq("id", hotelId);
    if (error) return { error: error.message };
    revalidatePath("/hotels");
    revalidatePath(`/hotels/${hotelId}`);
    redirect(`/hotels/${hotelId}`);
  }

  const { data, error } = await supabase
    .from("hotels")
    .insert(payload)
    .select("id")
    .single();
  if (error) return { error: error.message };

  revalidatePath("/hotels");
  redirect(`/hotels/${data.id}`);
}

export async function setHotelActive(hotelId: string, isActive: boolean) {
  const admin = await requireAdmin();
  if (!admin.ok) return;

  const supabase = await createClient();
  await supabase.from("hotels").update({ is_active: isActive }).eq("id", hotelId);
  revalidatePath("/hotels");
  revalidatePath(`/hotels/${hotelId}`);
}
