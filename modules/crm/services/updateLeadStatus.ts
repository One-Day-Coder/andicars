import type { SupabaseClient } from "@supabase/supabase-js";
import type { LeadPriority, LeadStatus } from "@/modules/crm/types";

export type UpdateLeadInput = {
  status?: LeadStatus;
  priority?: LeadPriority;
  next_contact_at?: string | null;
  loss_reason?: string | null;
};

export function updateLeadStatus(supabase: SupabaseClient, leadId: string, values: UpdateLeadInput) {
  return supabase.from("leads").update(values).eq("id", leadId);
}
