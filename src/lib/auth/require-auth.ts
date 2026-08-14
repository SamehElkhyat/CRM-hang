import { createClient } from "@/lib/supabase/server";

export async function requireAuthedSupabase() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false as const };
  }
  return { ok: true as const, supabase, userId: user.id };
}
