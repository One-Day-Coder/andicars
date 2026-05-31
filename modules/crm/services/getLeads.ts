import type { SupabaseClient } from "@supabase/supabase-js";
import { leadWithVehicleSelect } from "@/modules/crm/queries";
import type { Lead } from "@/modules/crm/types";

export async function getLeads(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("leads")
    .select(`${leadWithVehicleSelect}, lead_notes(*)`)
    .order("created_at", { ascending: false });

  return { leads: (data || []) as Lead[], error };
}
