import { getCurrentUser } from "@/lib/auth/get-current-profile";

// Route-handler guard for admin-only endpoints. Real enforcement still
// happens at the RLS layer — this is a fast, clear failure before we
// bother calling the database.
export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.profile?.role !== "admin") {
    return { ok: false as const, response: { status: 403 as const } };
  }
  return { ok: true as const, user };
}
