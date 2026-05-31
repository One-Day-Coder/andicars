import type { SupabaseClient } from "@supabase/supabase-js";

export function createLeadNote(
  supabase: SupabaseClient,
  leadId: string,
  note: string,
  userId: string | null,
  isSystem = false
) {
  return supabase.from("lead_notes").insert({
    lead_id: leadId,
    note,
    created_by: userId,
    is_system: isSystem
  });
}
