import type { SupabaseClient } from "@supabase/supabase-js";

export function deleteAdminUser(supabase: SupabaseClient, userId: string) {
  return supabase.from("admin_users").delete().eq("user_id", userId);
}
