import type { SupabaseClient } from "@supabase/supabase-js";
import type { AdminRole } from "@/modules/core";

export function createAdminUser(supabase: SupabaseClient, userId: string, email: string, role: AdminRole) {
  return supabase.from("admin_users").upsert({
    user_id: userId,
    email,
    role
  });
}
