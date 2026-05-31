import type { SupabaseClient } from "@supabase/supabase-js";
import type { LeadStatus } from "@/modules/crm/types";

export function closeLead(supabase: SupabaseClient, leadId: string, status: Extract<LeadStatus, "no_responde" | "perdido" | "cerrado">) {
  return supabase.from("leads").update({ status }).eq("id", leadId);
}
