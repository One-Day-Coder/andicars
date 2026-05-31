import type { SupabaseClient } from "@supabase/supabase-js";

export function reactivateLead(supabase: SupabaseClient, leadId: string) {
  return supabase.from("leads").update({ status: "contactado" }).eq("id", leadId);
}
