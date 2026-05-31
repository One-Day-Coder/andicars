import type { SupabaseClient } from "@supabase/supabase-js";
import type { AdminRole } from "@/modules/core";

export function updateAdminUser(
  supabase: SupabaseClient,
  userId: string,
  values: { email?: string | null; nickname?: string | null; role?: AdminRole }
) {
  return supabase.from("admin_users").update(values).eq("user_id", userId);
}
