import type { SupabaseClient } from "@supabase/supabase-js";

export function markLeadAsLost(supabase: SupabaseClient, leadId: string, lossReason: string | null = null) {
  return supabase.from("leads").update({ status: "perdido", loss_reason: lossReason }).eq("id", leadId);
}
