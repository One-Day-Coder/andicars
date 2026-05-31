import type { SupabaseClient } from "@supabase/supabase-js";

export type CreateLeadInput = {
  vehicle_id?: string | null;
  customer_name: string;
  phone: string;
  email?: string | null;
  message?: string | null;
  source?: string;
};

export function createLead(supabase: SupabaseClient, input: CreateLeadInput) {
  return supabase.from("leads").insert({
    vehicle_id: input.vehicle_id || null,
    customer_name: input.customer_name,
    phone: input.phone,
    email: input.email || null,
    message: input.message || null,
    source: input.source || "web"
  });
}
