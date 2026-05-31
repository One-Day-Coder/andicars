import type { SupabaseClient } from "@supabase/supabase-js";

export function cancelSale(supabase: SupabaseClient, saleId: string) {
  return supabase.from("sales").update({ operation_status: "cancelado" }).eq("id", saleId);
}
